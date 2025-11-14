import { Dispatch, SetStateAction } from "react";

export type TabanDatePickerProps = {
	placeholder?: string;
	selectedDate: string | null;
	setSelectedDate: Dispatch<SetStateAction<string | null>>;
};
