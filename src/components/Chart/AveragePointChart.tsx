"use client";

import { BarChart, Legend, Title } from "@tremor/react";

import {
	Button,
	Modal,
	ModalContent,
	Spinner,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";

import { GET_SUBJECT_AVERAGE_POINT } from "@/constants/api_endpoint";
import SemesterContext from "@/contexts/SemesterContext";
import withQuery from "@/utils/withQuery";
import { useState } from "react";
import useSWR from "swr";
import CriteriaSelector from "@components/CriteriaSelector";
import SemesterSelector from "@components/SemesterSelector/SemesterSelector";
import BaseChart from "@components/Chart/BaseChart";
import { SortSelector } from "@components/SortSelector";

export default function AveragePointChart() {
	const [semester, setSemester] = useState<Semester | undefined>();
	const [criteria, setCriteria] = useState<Criteria | undefined>();

	const [selectedKeys, setSelectedKeys] = useState(new Set(["desc"]));

	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const { data, isLoading } = useSWR<IChartData[]>(
		withQuery(GET_SUBJECT_AVERAGE_POINT, {
			semester_id: semester?.semester_id,
			criteria_id: criteria?.criteria_id,
			sort: selectedKeys.has("asc") ? "asc" : "desc",
		}),
		(url: string) => fetch(url).then((r) => r.json())
	);

	console.log({
		data,
	});

	return (
		<BaseChart>
			<div className=" relative w-full  px-8 py-5 mb-32 lg:mb-16">
				<div className=" absolute w-full top-0 left-0 px-8 py-5 flex flex-col lg:flex-row gap-5 justify-end items-start lg:items-center">
					<Title className=" mr-auto w-full">
						<p> Biểu đồ điểm trung bình các môn học</p>
						<div className="w-3/4 mt-2">
							<p className="w-full font-normal text-sm">
								{criteria?.display_name || "Tất cả các tiêu chí"}
							</p>
						</div>
					</Title>
					<div className="w-fit flex flex-row gap-4">
						<SemesterContext.Provider
							value={{
								semester,
								setSemester: (data) => setSemester(data),
							}}
						>
							<SemesterSelector />
							<Tooltip
								content={
									<div className="">
										<p className=" max-w-md h-auto">
											{criteria
												? criteria.display_name
												: "Nếu không chọn, tất cả các tiêu chí sẽ được xét"}
										</p>
									</div>
								}
							>
								<Button onPress={onOpen} className="">
									<p className="">
										{criteria
											? `Tiêu chí ${criteria.index}`
											: "Chọn tiêu chí"}
									</p>
								</Button>
							</Tooltip>
							<SortSelector
								selectedKeys={selectedKeys}
								setSelectedKeys={setSelectedKeys}
							></SortSelector>
						</SemesterContext.Provider>
					</div>
				</div>
			</div>
			<Legend
				className="ml-14 mb-5"
				categories={[LEGEND_NAME]}
				colors={["sky"]}
			/>
			<div className="w-full h-fit overflow-x-auto bg-white dark:bg-neutral-900">
				<div
					className="pr-4 h-fit"
					style={{
						width:
							data?.length || 0 > 0 ? (data?.length || 0) * 60 : "100%",
					}}
				>
					<BarChart
						className=" h-72 mt-4"
						data={
							data?.map((d) => ({
								...d,
								[LEGEND_NAME]: d.average_point / d.max_point,
							})) || []
						}
						index="display_name"
						categories={[LEGEND_NAME]}
						colors={["sky"]}
						yAxisWidth={80}
						autoMinValue
						valueFormatter={dataFormatter}
						showLegend={false}
						//@ts-ignore
						noDataText={
							isLoading ? (
								<div className=" flex flex-row items-center gap-4">
									<Spinner size="sm" />
									<p className=" text-medium font-medium">Đang tải</p>
								</div>
							) : (
								<p className=" text-medium font-medium">
									Không có dữ liệu
								</p>
							)
						}
					/>
				</div>
			</div>
			<Modal
				isOpen={isOpen}
				className="h-full"
				backdrop="blur"
				size="3xl"
				onOpenChange={onOpenChange}
				scrollBehavior={"inside"}
			>
				<ModalContent>
					{(onClose) => (
						<CriteriaSelector
							criteria={criteria}
							setCriteria={setCriteria}
							onClose={onClose}
						/>
					)}
				</ModalContent>
			</Modal>
		</BaseChart>
	);
}

const dataFormatter = (number: number) => {
	// return "$ " + Intl.NumberFormat("us").format(number).toString();
	return `${Math.round(number * 100)}%`;
};

interface IChartData {
	average_point: number;
	display_name: string;
	max_point: number;
	subject_id: string;
}

const LEGEND_NAME = "Độ hài lòng";