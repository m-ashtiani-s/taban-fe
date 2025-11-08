import { Dispatch, InputHTMLAttributes, SetStateAction, TextareaHTMLAttributes } from "react";

export type TabanInputProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	width?: number;
	minHeight?: number;
	inputClassName?: string;
	label?: string;
	variant?: string;
	endAdornment?: string;
	setValue?: Dispatch<SetStateAction<any>>;
	groupMode?: boolean;
	hasLeading?: boolean;
	isHandleError?: boolean;
	hasError?: boolean;
	errorText?: string;
	removeHandler?: () => void;
	isLtr?: boolean;
	isPasswordInput?: boolean;
	ref?: any;
};
