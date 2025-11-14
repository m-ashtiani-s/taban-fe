import React from "react";
import AutoCompleteErrorComponent from "../../autoCompleteErrorComponent/autoCompleteErrorComponent";
import TabanAutoComplete from "../tabanAutoComplete/tabanAutoComplete";
import { TabanAutoWrapperFinalProps } from "./tabanAutoWrapperProps";

export default function TabanAutocompleteWrapper<Option>({
	wrapperErrorText,
	errorClassName,
	executeFunction,
	resultStatus = true,
	mode="autoComplete",
	...rest
}: TabanAutoWrapperFinalProps<Option>) {
	return (
		<div className="w-full">
			{resultStatus === false ? (
				<AutoCompleteErrorComponent
					executeFunction={executeFunction}
					errorText={wrapperErrorText}
					className={errorClassName}
					loading={rest?.loading}
					disabled={rest?.disabled || rest?.loading}
				/>
			) : rest?.loading ? (
				<TabanAutoComplete {...rest} />
			) : (
				<TabanAutoComplete {...rest} />
			)}
		</div>
	);
}
