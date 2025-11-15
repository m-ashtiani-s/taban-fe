import { InputHTMLAttributes, ReactNode } from "react";

export type TabanCheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
    label?:ReactNode;
	selected?: boolean;
};
