"use client";

import { Dispatch, SetStateAction, useState } from "react";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanAutocompleteWrapper from "@/app/_components/common/tabanAutocompleteWrapper/tabanAutocompleteWrapper";
import { ShippingAddressFilters } from "../../_types/shippingAddress.type";

type LocationOption = { id: number; name: string };
type BooleanOption = { label: string; value: boolean | null };

const booleanOptions: BooleanOption[] = [
	{ label: "همه", value: null },
	{ label: "فعال", value: true },
	{ label: "غیرفعال", value: false },
];

type AddressFiltersProps = {
	setFilters: Dispatch<SetStateAction<ShippingAddressFilters>>;
	dataLoading: boolean;
};

export default function AddressFilters({ setFilters, dataLoading }: AddressFiltersProps) {
	const [term, setTerm] = useState<string>("");
	const [selectedIsActive, setSelectedIsActive] = useState<BooleanOption | null>(null);


	const searchHandler = () => {
		setFilters({
			term: term?.trim() || undefined,
			isActive: selectedIsActive?.value ?? undefined,
		});
	};

	const resetHandler = () => {
		setTerm("");
		setSelectedIsActive(null);
		setFilters({});
	};

	return (
		<div className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-5 shadow-sm">
			<div className="flex gap-3 items-start flex-wrap">
				<div className="w-full sm:w-[200px]">
					<TabanInput
						label="جستجو (عنوان یا آدرس)"
						value={term}
						setValue={setTerm}
						disabled={dataLoading}
						onKeyDown={(e) => {
							if (e?.key === "Enter") searchHandler();
						}}
					/>
				</div>
				
				<div className="w-full sm:w-[150px]">
					<TabanAutocompleteWrapper
						label="وضعیت"
						options={booleanOptions}
						selectedOption={selectedIsActive}
						setSelectedOption={setSelectedIsActive}
						valueField="value"
						displayField="label"
						loading={false}
						disabled={dataLoading}
						wrapperErrorText=""
						resultStatus={true}
					/>
				</div>
				<div className="flex gap-2 items-center pt-0.5">
					<TabanButton onClick={searchHandler} disabled={dataLoading} isLoading={dataLoading} loadingText="در حال جستجو">
						جستجو
					</TabanButton>
					<TabanButton variant="bordered" onClick={resetHandler} disabled={dataLoading}>
						پاک کردن
					</TabanButton>
				</div>
			</div>
		</div>
	);
}
