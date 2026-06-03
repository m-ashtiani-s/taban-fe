"use client";

import { useEffect } from "react";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import { OrderRates } from "../../../_hooks/useOrderRates";
import StepHeader from "../../stepHeader/stepHeader";
import DocumentSection from "../../documentSection/documentSection";

type BaseStepProps = {
	rates: OrderRates;
};

export default function BaseStep({ rates }: BaseStepProps) {
	const { order, setOrder } = useNewOrderStore();
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);

	const baseTitle = rates.baseRate.result?.success ? rates.baseRate.result.data?.data?.[0]?.title ?? "نرخ پایه" : "نرخ پایه";

	// مقداردهی اولیه‌ی تعداد پایه برای هر مدرک (پیش‌فرض ۱)
	useEffect(() => {
		const current = order?.baseRateCount ?? {};
		const next: Record<string, string> = { ...current };
		let changed = false;
		keys.forEach((key) => {
			if (next[key] === undefined || next[key] === "") {
				next[key] = "1";
				changed = true;
			}
		});
		if (changed) setOrder((prev) => ({ ...prev, baseRateCount: next }));
	}, []);

	const setBaseCount = (updater: any) => {
		setOrder((prev) => {
			const current = prev?.baseRateCount ?? {};
			return { ...prev, baseRateCount: typeof updater === "function" ? updater(current) : updater };
		});
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader title={`${baseTitle} مدارک`} subtitle="تعداد پایه‌ی هر مدرک را برای محاسبه‌ی دقیق نرخ ترجمه وارد کنید" />

			<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
				{keys.map((key, index) => (
					<DocumentSection key={key} index={index} title={names[key] ?? "مدرک"}>
						<div className="flex flex-col gap-2">
							<span className="text-sm text-neutral-500">{baseTitle}</span>
							<div className="w-full sm:w-72">
								<TabanInput
									isNumber
									type="number"
									value={order?.baseRateCount?.[key] ?? ""}
									groupMode
									setValue={setBaseCount}
									name={key}
									label={baseTitle}
								/>
							</div>
						</div>
					</DocumentSection>
				))}
			</div>
		</div>
	);
}
