import { Radio, RadioGroup } from "@nextui-org/react";
import { TabanRadioGroupProps } from "./tabanRadioGroup.type";

export default function TabanRadioGroup({ options = [], selected, setSelected, ...rest }: TabanRadioGroupProps) {
	return (
		<RadioGroup value={selected} onValueChange={setSelected} className="[&_>div]:gap-8" orientation="horizontal" color="secondary" >
			{options?.map((it) => (
				<Radio key={it?.optionValue} value={it?.optionValue}>
					{it?.optionLabel}
				</Radio>
			))}
		</RadioGroup>
	);
}
