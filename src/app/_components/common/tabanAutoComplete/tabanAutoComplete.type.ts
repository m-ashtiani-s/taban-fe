import { Dispatch, ReactNode, SetStateAction } from "react";

export type TabanAutoCompleteProps<Option> = {
	placeholder?: string;
	label?: string;
	className?: string;
	name?: string;
	inputOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onChange?: (selectedOption: Option | null) => void;
	selectedOption: Option | null;
	setSelectedOption: Dispatch<SetStateAction<Option | null>>;
	options: Option[];
	displayField?: keyof Option;
	valueField?: keyof Option;
	hasLeading?: boolean;
	loading?: boolean;
	isHandleError?: boolean;
	hasError?: boolean;
	disabled?: boolean;
	scrolled?: boolean;
	ItemKey?: (option:Option)=>string;
	errorText?: string;
	height?:number;
	renderItem?: (option:Option)=>ReactNode;
	emptyText?:string
};
