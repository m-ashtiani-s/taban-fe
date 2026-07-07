"use client";

import { IconCheck, IconDocument, IconTick } from "@/app/_components/icon/icons";
import { toCurrency } from "@/utils/string";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import StepHeader from "../../stepHeader/stepHeader";
import DocumentSection from "../../documentSection/documentSection";
import { OrderRates } from "../../../_hooks/useOrderRates";

type ScanStepProps = {
	rates: OrderRates;
};

/**
 * مرحله‌ی انتخاب اسکن مدارک.
 * کاربر برای هر مدرک مشخص می‌کند آیا نیاز به اسکن دارد یا نه.
 * نرخ اسکن فقط به نوع مدرک وابسته است و زبان در آن تأثیری ندارد.
 */
export default function ScanStep({ rates }: ScanStepProps) {
	const { order, setOrder } = useNewOrderStore();
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);

	const scanRate = rates.scanRates.result?.success ? rates.scanRates.result.data?.data?.[0] ?? null : null;

	const toggleScan = (key: string) => {
		setOrder((prev) => {
			const current = prev?.scanRateIdByDoc ?? {};
			const isSelected = !!current[key];
			return {
				...prev,
				scanRateIdByDoc: {
					...current,
					[key]: isSelected ? null : (scanRate?.scanRateId ?? null),
				},
			};
		});
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="اسکن مدارک"
				subtitle="در صورت نیاز، می‌توانید برای هر مدرک سرویس اسکن را انتخاب کنید"
				icon={<IconDocument width={24} height={24} className="fill-current stroke-0" />}
			/>

			<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
				{keys.map((key, index) => {
					const isSelected = !!(order?.scanRateIdByDoc?.[key]);
					return (
						<DocumentSection key={key} index={index} title={names[key] ?? "مدرک"}>
							<div className="flex flex-col gap-3">
								<button
									type="button"
									onClick={() => toggleScan(key)}
									className={`flex items-center gap-3 w-full text-right rounded-xl border px-4 py-4 duration-150 ${
										isSelected ? "border-secondary bg-secondary/5" : "border-neutral-200 hover:border-secondary/40"
									}`}
								>
									<span
										className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
											isSelected ? "bg-secondary border-secondary" : "border-neutral-300"
										}`}
									>
										{isSelected && <IconTick className="stroke-white w-4 h-4" strokeWidth={3.5} />}
									</span>
									<div className="flex flex-1 items-center justify-between">
										<span className="text-sm font-medium text-primary">
											اسکن این مدرک
										</span>
										{scanRate && (
											<span className={`text-sm font-semibold ${isSelected ? "text-secondary" : "text-neutral-500"}`}>
												{toCurrency(scanRate.price)} تومان
											</span>
										)}
									</div>
								</button>
							</div>
						</DocumentSection>
					);
				})}
			</div>
		</div>
	);
}
