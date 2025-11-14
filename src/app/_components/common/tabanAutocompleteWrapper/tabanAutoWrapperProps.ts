import { TabanAutoCompleteProps } from "../tabanAutoComplete/tabanAutoComplete.type";


export type Mode = "autoComplete" | "autoCompleteCheckBox";

export type TabanAutoCompleteCheckBoxWrapperProps<Option> = TabanAutoCompleteProps<Option> & {
	executeFunction?: () => void;
	wrapperErrorText?: string;
	errorClassName?: string;
	resultStatus?: boolean | undefined;
	mode?: "autoComplete";
};

export type TabanAutoWrapperFinalProps<Option> = TabanAutoCompleteCheckBoxWrapperProps<Option>;
