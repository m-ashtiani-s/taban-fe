"use client";

import { IconEmbassy, IconGuarantee } from "@/app/_components/icon/icons";
import { EmbassyRate } from "@/types/embassyRate.type";
import { EmbassySelection } from "@/types/createOrder.type";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import { OrderRates } from "../../../_hooks/useOrderRates";
import StepHeader from "../../stepHeader/stepHeader";
import DocumentSection from "../../documentSection/documentSection";
import SelectCard from "../../selectCard/selectCard";

type EmbassyStepProps = {
	rates: OrderRates;
};

export default function EmbassyStep({ rates }: EmbassyStepProps) {
	const { order, setOrder } = useNewOrderStore();
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);

	const embassyRates: EmbassyRate[] = rates.embassies.result?.success
		? rates.embassies.result.data?.data ?? []
		: [];

	const isSelected = (rateId: string, docKey: string): boolean => {
		const item = order?.embassyItems?.find((it) => it?.translationItemId === docKey);
		return !!item?.embassies?.some((it) => it?.embassyRateId === rateId);
	};

	const toggle = (rate: EmbassyRate, docKey: string, docTitle: string) => {
		const selection: EmbassySelection = { embassyRateId: rate.embassyRateId };
		setOrder((prev) => {
			const others = (prev?.embassyItems ?? []).filter((it) => it?.translationItemId !== docKey);
			const current = prev?.embassyItems?.find((it) => it?.translationItemId === docKey);
			const selected = current?.embassies?.some((it) => it?.embassyRateId === rate.embassyRateId);
			const embassies: EmbassySelection[] = selected
				? (current?.embassies ?? []).filter((it) => it?.embassyRateId !== rate.embassyRateId)
				: [...(current?.embassies ?? []), selection];
			return {
				...prev,
				embassyItems: [...others, { translationItemId: docKey, translationItemTitle: docTitle, embassies }],
			};
		});
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader title="تایید سفارت" subtitle="در صورت نیاز به تایید سفارت، سفارت‌های مربوط به هر مدرک را انتخاب کنید (اختیاری)" />

			<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
				{keys.map((docKey, index) => (
					<DocumentSection key={docKey} index={index} title={names[docKey] ?? "مدرک"}>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{embassyRates.map((rate) => (
								<SelectCard
									key={rate.embassyRateId}
									selected={isSelected(rate.embassyRateId, docKey)}
									onClick={() => toggle(rate, docKey, names[docKey] ?? "-")}
									icon={<IconEmbassy viewBox="0 0 50 64" width={32} height={32} className="stroke-current stroke-2" />}
									title={rate.embassyName}
								/>
							))}
						</div>
					</DocumentSection>
				))}
			</div>
		</div>
	);
}
