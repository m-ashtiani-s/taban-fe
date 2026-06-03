"use client";

import { IconInquiry } from "@/app/_components/icon/icons";
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

	const isSelected = (rateId: string, docKey: string): boolean => {
		const item = order?.justiceInquiriesItems?.find((it) => it?.translationItemId === docKey);
		return !!item?.justiceInquiries?.some((it) => it?.justiceInquiryRateId === rateId);
	};

	const toggle = (rate: JusticeInquiryRate, docKey: string, docTitle: string) => {
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
				{keys.map((docKey, index) => (
					<DocumentSection key={docKey} index={index} title={names[docKey] ?? "مدرک"}>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
					</DocumentSection>
				))}
			</div>
		</div>
	);
}
