"use client";

import { IconCheck, IconInfo, IconInquiry, IconJustice, IconTick } from "@/app/_components/icon/icons";
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

	const isSelfInquiry = (docKey: string): boolean => !!order?.selfInquiryByDoc?.[docKey];

	const isSelected = (rateId: string, docKey: string): boolean => {
		if (!hasJusticeCert(docKey) || isSelfInquiry(docKey)) return false;
		const item = order?.justiceInquiriesItems?.find((it) => it?.translationItemId === docKey);
		return !!item?.justiceInquiries?.some((it) => it?.justiceInquiryRateId === rateId);
	};

	// با فعال‌کردن «خودم می‌گیرم»، انتخاب استعلام‌های همان مدرک پاک می‌شود
	const toggleSelfInquiry = (docKey: string) => {
		if (!hasJusticeCert(docKey)) return;
		setOrder((prev) => {
			const next = !prev?.selfInquiryByDoc?.[docKey];
			return {
				...prev,
				selfInquiryByDoc: { ...(prev?.selfInquiryByDoc ?? {}), [docKey]: next },
				justiceInquiriesItems: next
					? (prev?.justiceInquiriesItems ?? []).filter((it) => it?.translationItemId !== docKey)
					: (prev?.justiceInquiriesItems ?? []),
			};
		});
	};

	const toggle = (rate: JusticeInquiryRate, docKey: string, docTitle: string) => {
		// بدون مهر دادگستری یا وقتی کاربر خودش استعلام می‌گیرد، انتخاب استعلام مجاز نیست
		if (!hasJusticeCert(docKey) || isSelfInquiry(docKey)) return;
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

	// استعلام فقط برای مدارکی که «مهر دادگستری» دارند نمایش داده می‌شود
	const allowedKeys = keys.filter((docKey) => hasJusticeCert(docKey));

	return (
		<div className="flex flex-col gap-8">
			<StepHeader title="استعلام‌های ترجمه" subtitle="در صورت نیاز به استعلام خاص، آن‌ها را برای هر مدرک انتخاب کنید (اختیاری)" />

			<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
				{allowedKeys.length === 0 ? (
					<div className="flex items-center gap-2.5 bg-secondary/5 border border-secondary/30 rounded-2xl px-4 py-4">
						<IconJustice width={26} height={26} viewBox="0 0 48 48" className="fill-secondary stroke-0 shrink-0" />
						<span className="text-sm leading-7 text-primary peyda font-semibold">
							استعلام تنها برای مدارکی قابل انتخاب است که «مهر دادگستری» دارند. در صورت نیاز، در مرحله‌ی تاییدات مهر دادگستری را فعال کنید.
						</span>
					</div>
				) : (
					allowedKeys.map((docKey, index) => {
						const selfInq = isSelfInquiry(docKey);
						return (
							<DocumentSection key={docKey} index={index} title={names[docKey] ?? "مدرک"}>
								<div
									className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
										selfInq ? "opacity-40 pointer-events-none select-none" : ""
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

								<div className="mt-4 pt-4 border-t border-dashed border-neutral-200">
									<button
										type="button"
										onClick={() => toggleSelfInquiry(docKey)}
										className={`flex items-center gap-2.5 w-full text-right rounded-xl border px-4 py-3 duration-150 ${
											selfInq ? "border-secondary bg-secondary/5" : "border-neutral-200 hover:border-secondary/40"
										}`}
									>
										<span
											className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
												selfInq ? "bg-secondary border-secondary" : "border-neutral-300"
											}`}
										>
											{selfInq && <IconTick className="stroke-white w-4 h-4" strokeWidth={3.5} />}
										</span>
										<span className="text-sm font-medium text-primary">استعلام‌های این مدرک را خودم تهیه می‌کنم</span>
									</button>
									{selfInq && (
										<div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 flex items-start gap-2.5">
											<IconInfo className="stroke-sky-600 w-5 h-5 shrink-0 mt-0.5" />
											<span className="text-xs leading-6 text-sky-700">
												می‌توانید بعداً در پنل کاربری، در بخش جزئیات سفارش، نتیجه‌ی استعلام را برای ما آپلود کنید. کارشناسان ما در این زمینه شما را راهنمایی می‌کنند.
											</span>
										</div>
									)}
								</div>
							</DocumentSection>
						);
					})
				)}
			</div>
		</div>
	);
}
