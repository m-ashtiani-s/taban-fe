import { RadioGroupProps } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";

export type TabanRadioGroupProps = Omit<RadioGroupProps, "ref"> & {
	options: {
		optionLabel: string;
		optionValue: any;
	}[];
	selected:any;
	setSelected:Dispatch<SetStateAction<any>>;
};
