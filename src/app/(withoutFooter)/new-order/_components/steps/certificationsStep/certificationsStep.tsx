"use client";

import { IconJustice, IconMfa } from "@/app/_components/icon/icons";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import { OrderRates } from "../../../_hooks/useOrderRates";
import StepHeader from "../../stepHeader/stepHeader";
import DocumentSection from "../../documentSection/documentSection";
import SelectCard from "../../selectCard/selectCard";

type CertificationsStepProps = {
	rates: OrderRates;
};

type CertType = "justice" | "mfa";

export default function CertificationsStep({ rates }: CertificationsStepProps) {
	const { order, setOrder } = useNewOrderStore();
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);

	const rate = rates.certifications.result?.success ? rates.certifications.result.data?.data?.[0] ?? null : null;

	const isSelected = (type: CertType, docKey: string): boolean => {
		if (type === "justice") {
			return !!order?.justiceCertification?.find((it) => it?.translationItemId === docKey)?.justiceCertification;
		}
		return !!order?.mfaCertification?.find((it) => it?.translationItemId === docKey)?.mfaCertification;
	};

	const toggle = (type: CertType, docKey: string, docTitle: string) => {
		if (!rate) return;
		const selection = { certificationRateId: rate.certificationRateId };
		const justiceEntry = { translationItemId: docKey, translationItemTitle: docTitle, justiceCertification: selection };
		const mfaEntry = { translationItemId: docKey, translationItemTitle: docTitle, mfaCertification: selection };

		setOrder((prev) => {
			const justiceList = prev?.justiceCertification ?? [];
			const mfaList = prev?.mfaCertification ?? [];
			const justiceSelected = !!justiceList.find((it) => it?.translationItemId === docKey)?.justiceCertification;
			const mfaSelected = !!mfaList.find((it) => it?.translationItemId === docKey)?.mfaCertification;
			const justiceOthers = justiceList.filter((it) => it?.translationItemId !== docKey);
			const mfaOthers = mfaList.filter((it) => it?.translationItemId !== docKey);

			if (type === "justice") {
				// تا وقتی مهر وزارت امور خارجه فعال است، مهر دادگستری اجباری و غیرقابل‌حذف است
				if (justiceSelected && mfaSelected) return prev;
				return {
					...prev,
					justiceCertification: justiceSelected ? justiceOthers : [...justiceOthers, justiceEntry],
				};
			}

			// برداشتن مهر وزارت امور خارجه؛ مهر دادگستری دست‌نخورده می‌ماند
			if (mfaSelected) {
				return { ...prev, mfaCertification: mfaOthers };
			}
			// انتخاب مهر وزارت امور خارجه، مهر دادگستری را هم اجباراً فعال می‌کند
			return {
				...prev,
				mfaCertification: [...mfaOthers, mfaEntry],
				justiceCertification: justiceSelected ? justiceList : [...justiceOthers, justiceEntry],
			};
		});
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader title="مهر و تاییدات ترجمه" subtitle="در صورت نیاز، مهرهای رسمی هر مدرک را انتخاب کنید (اختیاری)" />

			<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
				{keys.map((docKey, index) => (
					<DocumentSection key={docKey} index={index} title={names[docKey] ?? "مدرک"}>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<SelectCard
								selected={isSelected("justice", docKey)}
								onClick={() => toggle("justice", docKey, names[docKey] ?? "-")}
								icon={<IconJustice width={36} height={36} viewBox="0 0 48 48" className="fill-current stroke-0" />}
								title="مهر دادگستری"
								description={
									isSelected("mfa", docKey)
										? "همراه مهر وزارت امور خارجه الزامی است و قابل حذف نیست"
										: "تایید رسمی ترجمه توسط قوه قضاییه"
								}
								className={isSelected("mfa", docKey) ? "cursor-not-allowed" : ""}
							/>
							<SelectCard
								selected={isSelected("mfa", docKey)}
								onClick={() => toggle("mfa", docKey, names[docKey] ?? "-")}
								icon={<IconMfa width={32} height={32} className="stroke-current fill-none" />}
								title="مهر وزارت امور خارجه"
								description="تایید رسمی ترجمه توسط وزارت امور خارجه"
							/>
						</div>
					</DocumentSection>
				))}
			</div>
		</div>
	);
}
