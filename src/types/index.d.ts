declare interface Semester {
	display_name: string;
	semester_id: string;
}

declare interface Comment {
	content: string;
	type: "positive" | "negative";
	comment_id: string;
	teach_id: string;
}