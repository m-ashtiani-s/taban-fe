"use client";

import { IconCheck, IconEmbassy, IconTick } from "@/app/_components/icon/icons";
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

	// تایید سفارت تنها زمانی مجاز است که هم «مهر دادگستری» و هم «مهر وزارت امور خارجه» همان مدرک فعال باشند
	const hasJusticeCert = (docKey: string): boolean =>
		!!order?.justiceCertification?.find((it) => it?.translationItemId === docKey)?.justiceCertification;
	const hasMfaCert = (docKey: string): boolean =>
		!!order?.mfaCertification?.find((it) => it?.translationItemId === docKey)?.mfaCertification;
	const embassyAllowed = (docKey: string): boolean => hasJusticeCert(docKey) && hasMfaCert(docKey);

	// آیا کاربر می‌خواهد این مدرک به تایید سفارت برسد؟ این تمایل با وجودِ یک ورودی در embassyItems نگهداری
	// می‌شود (حتی بدون انتخابِ سفارت) تا بتوان در مرحله‌ی بعد، انتخابِ حداقل یک سفارت را اجباری کرد.
	const wantEmbassy = (docKey: string): boolean => !!order?.embassyItems?.some((it) => it?.translationItemId === docKey);

	const toggleWantEmbassy = (docKey: string, docTitle: string) => {
		setOrder((o) => {
			const others = (o?.embassyItems ?? []).filter((it) => it?.translationItemId !== docKey);
			// برداشتن تمایل: انتخاب‌های سفارتِ این مدرک هم پاک می‌شوند
			if ((o?.embassyItems ?? []).some((it) => it?.translationItemId === docKey)) {
				return { ...o, embassyItems: others };
			}
			// ابراز تمایل: یک ورودیِ خالی ایجاد می‌شود تا انتخابِ حداقل یک سفارت الزامی شود
			return { ...o, embassyItems: [...others, { translationItemId: docKey, translationItemTitle: docTitle, embassies: [] }] };
		});
	};

	const isSelected = (rateId: string, docKey: string): boolean => {
		if (!embassyAllowed(docKey)) return false;
		const item = order?.embassyItems?.find((it) => it?.translationItemId === docKey);
		return !!item?.embassies?.some((it) => it?.embassyRateId === rateId);
	};

	const toggle = (rate: EmbassyRate, docKey: string, docTitle: string) => {
		if (!embassyAllowed(docKey)) return;
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
				{keys.map((docKey, index) => {
					const allowed = embassyAllowed(docKey);
					const want = wantEmbassy(docKey);
					const hasSelection = (order?.embassyItems?.find((it) => it?.translationItemId === docKey)?.embassies?.length ?? 0) > 0;
					return (
						<DocumentSection key={docKey} index={index} title={names[docKey] ?? "مدرک"}>
							{!allowed ? (
								<div className="flex items-center gap-2.5 bg-secondary/5 border border-secondary/30 rounded-xl px-4 py-3">
									<IconEmbassy viewBox="0 0 50 64" width={24} height={24} className="stroke-secondary stroke-2 shrink-0" />
									<span className="text-xs leading-6 text-primary peyda font-semibold">
										برای تایید سفارت این مدرک، ابتدا «مهر دادگستری» و «مهر وزارت امور خارجه» را در مرحله‌ی تاییدات فعال کنید
									</span>
								</div>
							) : (
								<div className="flex flex-col gap-4">
									{/* تیکِ تمایل: تا انتخاب نشود، سفارت‌ها نمایش داده نمی‌شوند */}
									<button
										type="button"
										onClick={() => toggleWantEmbassy(docKey, names[docKey] ?? "-")}
										className={`flex items-center gap-2.5 w-full text-right rounded-xl border px-4 py-3 duration-150 ${
											want ? "border-secondary bg-secondary/5" : "border-neutral-200 hover:border-secondary/40"
										}`}
									>
										<span
											className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
												want ? "bg-secondary border-secondary" : "border-neutral-300"
											}`}
										>
											{want && <IconTick className="stroke-white w-4 h-4" strokeWidth={3.5} />}
										</span>
										<span className="text-sm font-medium text-primary">می‌خواهم این مدرک به تایید سفارت برسد</span>
									</button>

									{want && (
										<div className="flex flex-col gap-2">
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
											{!hasSelection && (
												<span className="text-xs text-red-500">برای ادامه، حداقل یک سفارت را انتخاب کنید</span>
											)}
										</div>
									)}
								</div>
							)}
						</DocumentSection>
					);
				})}
			</div>
		</div>
	);
}
