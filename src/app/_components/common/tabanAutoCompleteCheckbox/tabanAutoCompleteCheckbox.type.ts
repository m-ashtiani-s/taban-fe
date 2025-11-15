import { Dispatch, ReactNode, SetStateAction } from "react";

export type AutocompleteProps<Option> =  {
	placeholder?: string;
	className?: string;
	name?: string;
	label?: string;
	inputOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onChange?: (selectedOption: Option | null) => void;
	selectedOptions: Option[];
	setSelectedOptions: Dispatch<SetStateAction<Option[]>>;
	options: Option[];
	displayField?: keyof Option;
	valueField?: keyof Option;
	hasLeading?: boolean;
	loading?: boolean;
	disabled?: boolean;
	scrolled?: boolean;
	height?:number;
	showChips?: boolean;
	chipsNumber?: number;
	isHandleError?: boolean;
    hasError?:boolean;
    errorText?:string;
	renderLabel?:(option:Option)=>ReactNode
}