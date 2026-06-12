"use client";

import { IconInquiry, IconJustice } from "@/app/_components/icon/icons";
import { JusticeInquiryRate } from "@/types/justiceInquiry.type";
import { JusticeInquirySelection } from "@/types/createOrder.type";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import { OrderRates } from "../../../_hooks/useOrderRates";
import StepHeader from "../../stepHeader/stepHeader";
import DocumentSection from "../../documentSection/documentSection";
import SelectCard from "../../selectCard/selectCard";

type InquiriesStepProps = {
	rates: OrderRates;
};

export default function InquiriesStep({ rates }: InquiriesStepProps) {
	const { order, setOrder } = useNewOrderStore();
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);

	const inquiryRates: JusticeInquiryRate[] = rates.justiceInquiries.result?.success
		? rates.justiceInquiries.result.data?.data ?? []
		: [];

	// استعلام‌ها تنها زمانی مجازند که «مهر دادگستری» همان مدرک فعال باشد
	const hasJusticeCert = (docKey: string): boolean =>
		!!order?.justiceCertification?.find((it) => it?.translationItemId === docKey)?.justiceCertification;

	const isSelected = (rateId: string, docKey: string): boolean => {
		if (!hasJusticeCert(docKey)) return false;
		const item = order?.justiceInquiriesItems?.find((it) => it?.translationItemId === docKey);
		return !!item?.justiceInquiries?.some((it) => it?.justiceInquiryRateId === rateId);
	};

	const toggle = (rate: JusticeInquiryRate, docKey: string, docTitle: string) => {
		// بدون مهر دادگستری، انتخاب استعلام مجاز نیست
		if (!hasJusticeCert(docKey)) return;
		const selection: JusticeInquirySelection = { justiceInquiryRateId: rate.justiceInquiryRateId };
		setOrder((prev) => {
			const others = (prev?.justiceInquiriesItems ?? []).filter((it) => it?.translationItemId !== docKey);
			const current = prev?.justiceInquiriesItems?.find((it) => it?.translationItemId === docKey);
			const selected = current?.justiceInquiries?.some((it) => it?.justiceInquiryRateId === rate.justiceInquiryRateId);
			const justiceInquiries: JusticeInquirySelection[] = selected
				? (current?.justiceInquiries ?? []).filter((it) => it?.justiceInquiryRateId !== rate.justiceInquiryRateId)
				: [...(current?.justiceInquiries ?? []), selection];
			return {
				...prev,
				justiceInquiriesItems: [...others, { translationItemId: docKey, translationItemTitle: docTitle, justiceInquiries }],
			};
		});
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader title="استعلام‌های ترجمه" subtitle="در صورت نیاز به استعلام خاص، آن‌ها را برای هر مدرک انتخاب کنید (اختیاری)" />

			<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
				{keys.map((docKey, index) => {
					const allowed = hasJusticeCert(docKey);
					return (
						<DocumentSection key={docKey} index={index} title={names[docKey] ?? "مدرک"}>
							<div className="relative">
								<div
									className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
										allowed ? "" : "opacity-40 pointer-events-none select-none"
									}`}
								>
									{inquiryRates.map((rate) => (
										<SelectCard
											key={rate.justiceInquiryRateId}
											selected={isSelected(rate.justiceInquiryRateId, docKey)}
											onClick={() => toggle(rate, docKey, names[docKey] ?? "-")}
											icon={<IconInquiry width={34} height={34} viewBox="0 0 1024 1024" className="fill-current stroke-0" />}
											title={rate.justiceInquiryName}
										/>
									))}
								</div>

								{!allowed && (
									<div className="absolute inset-0 flex items-center justify-center p-2">
										<div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-[2px] border border-secondary/40 shadow-sm rounded-2xl px-4 py-3 max-w-sm">
											<IconJustice width={26} height={26} viewBox="0 0 48 48" className="fill-secondary stroke-0 shrink-0" />
											<span className="text-xs leading-6 text-primary peyda font-semibold">
												برای انتخاب استعلام‌های این مدرک، ابتدا «مهر دادگستری» را در مرحله‌ی تاییدات فعال کنید
											</span>
										</div>
									</div>
								)}
							</div>
						</DocumentSection>
					);
				})}
			</div>
		</div>
	);
}
