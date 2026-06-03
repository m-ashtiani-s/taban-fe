"use client";

import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import { OrderRates } from "../../../_hooks/useOrderRates";
import { DynamicRate } from "@/types/dynamicRate.type";
import StepHeader from "../../stepHeader/stepHeader";
import DocumentSection from "../../documentSection/documentSection";

type SpecialsStepProps = {
	rates: OrderRates;
};

export default function SpecialsStep({ rates }: SpecialsStepProps) {
	const { order, setOrder } = useNewOrderStore();
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);
	const dynamicRates: DynamicRate[] = rates.dynamicRates.result?.success ? rates.dynamicRates.result.data?.data ?? [] : [];

	const getCount = (docKey: string, rateId: string): string => {
		const doc = order?.specialItems?.find((s) => s.translationItemId === docKey);
		const special = doc?.specials?.find((sp) => sp.dynamicRateId === rateId);
		return special ? String(special.count) : "";
	};

	const setCount = (docKey: string, docTitle: string, rateId: string, value: string) => {
		const count = Number(value);
		setOrder((prev) => {
			const items = [...(prev?.specialItems ?? [])];
			const docIndex = items.findIndex((s) => s.translationItemId === docKey);
			const doc = docIndex >= 0 ? { ...items[docIndex], specials: [...items[docIndex].specials] } : { translationItemId: docKey, translationItemTitle: docTitle, specials: [] };

			const valid = Number.isFinite(count) && count > 0;
			const specials = doc.specials.filter((sp) => sp.dynamicRateId !== rateId);
			if (valid) specials.push({ dynamicRateId: rateId, count });
			doc.specials = specials;
			doc.translationItemTitle = docTitle;

			if (docIndex >= 0) items[docIndex] = doc;
			else items.push(doc);
			return { ...prev, specialItems: items };
		});
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader title="موارد خاص ترجمه" subtitle="در صورت نیاز، تعداد موارد خاص هر مدرک را مشخص کنید (اختیاری)" />

			<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
				{keys.map((docKey, index) => (
					<DocumentSection key={docKey} index={index} title={names[docKey] ?? "مدرک"}>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
							{dynamicRates.map((rate) => (
								<div key={rate.dynamicRateId} className="flex flex-col gap-2">
									<div className="flex items-center gap-1.5">
										<span className="peyda font-semibold text-sm text-neutral-600">{rate.label}</span>
										{rate.description && (
											<div className="group relative inline-flex">
												<span className="w-5 h-5 text-xs bg-secondary/15 text-secondary rounded-full flex items-center justify-center cursor-help font-bold">
													؟
												</span>
												<div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 absolute right-0 top-7 z-20 w-60 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 text-xs text-neutral-500 leading-6">
													{rate.description}
												</div>
											</div>
										)}
									</div>
									<TabanInput
										isNumber
										type="number"
										value={getCount(docKey, rate.dynamicRateId)}
										onChange={(e) => setCount(docKey, names[docKey] ?? "-", rate.dynamicRateId, e.target.value)}
										name={rate.dynamicRateId}
									/>
								</div>
							))}
						</div>
					</DocumentSection>
				))}
			</div>
		</div>
	);
}
