"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { IconCheck, IconTranslate } from "@/app/_components/icon/icons";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { Language } from "@/types/language.type";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import { OrderRates } from "../../../_hooks/useOrderRates";
import StepHeader from "../../stepHeader/stepHeader";
import SelectCard from "../../selectCard/selectCard";
import CardsSkeleton from "../../cardsSkeleton/cardsSkeleton";

type LanguageStepProps = {
	rates: OrderRates;
	onSelectLanguage: (language: Language) => void;
};

const officialOptions = [
	{
		value: true,
		label: "ترجمه رسمی",
		desc: "شامل سنام، مهر مترجم و تمام هزینه‌های رسمی",
	},
	{
		value: false,
		label: "ترجمه غیررسمی",
		desc: "بدون سنام و مهر مترجم — مناسب ترجمه‌های غیررسمی",
	},
];

export default function LanguageStep({ rates, onSelectLanguage }: LanguageStepProps) {
	const { order, setOrder } = useNewOrderStore();
	const languages = useApi(async () => await TranslationEndpoints.getLanguages(), true);

	useEffect(() => {
		languages.fetchData();
	}, []);

	const list = languages.result?.success ? languages.result.data?.data ?? [] : [];
	const isOfficial = order?.isOfficial !== false;

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="زبان ترجمه را انتخاب کنید"
				subtitle="مدارک شما به زبان انتخابی ترجمه خواهد شد"
			/>

			{languages.loading ? (
				<CardsSkeleton count={6} />
			) : list.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{list.map((lang, index) => {
						const isSelected = order?.language?.languageId === lang.languageId;
						return (
							<motion.div
								key={lang.languageId}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
							>
								<SelectCard
									selected={isSelected}
									onClick={() => onSelectLanguage(lang)}
									icon={<IconTranslate width={26} height={26} className="fill-current stroke-0" />}
									title={lang.languageName}
									indicator="none"
									trailing={
										<div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
											<Image width={28} height={28} alt={lang.languageName} src={`/images/languages/${lang.languageCode}.png`} />
										</div>
									}
								/>
							</motion.div>
						);
					})}
				</div>
			) : !!languages.result && !languages.result.success && isRetryAble(languages.result.code) ? (
				<ErrorComponent executeFunction={() => languages.fetchData()} ticketAble errorText="دریافت لیست زبان‌ها با خطا مواجه شد." />
			) : (
				<div className="text-center text-sm text-neutral-400 py-10">داده‌ای موجود نیست</div>
			)}

			{/* نوع ترجمه: رسمی یا غیررسمی */}
			<div className="flex flex-col gap-3">
				<div className="text-sm font-semibold text-primary">نوع ترجمه</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{officialOptions.map((opt) => {
						const selected = isOfficial === opt.value;
						return (
							<button
								key={String(opt.value)}
								type="button"
								onClick={() => setOrder((prev) => ({ ...prev, isOfficial: opt.value }))}
								className={`flex items-start gap-3 text-right rounded-2xl border px-4 py-4 duration-150 ${
									selected
										? "border-secondary bg-secondary/5"
										: "border-neutral-200 hover:border-secondary/40"
								}`}
							>
								<span
									className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
										selected ? "border-secondary bg-secondary" : "border-neutral-300"
									}`}
								>
									{selected && <IconCheck className="stroke-white w-3 h-3" />}
								</span>
								<div className="flex flex-col gap-0.5">
									<span className={`text-sm font-semibold ${selected ? "text-secondary" : "text-primary"}`}>
										{opt.label}
									</span>
									<span className="text-xs text-neutral-500 leading-5">{opt.desc}</span>
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* وضعیت آماده‌سازی گزینه‌های وابسته به زبان */}
			{order?.language && rates.loading && (
				<div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
					<TabanLoading size={20} />
					در حال آماده‌سازی گزینه‌های ترجمه برای زبان انتخابی...
				</div>
			)}
			{order?.language && rates.attempted && !rates.loading && (
				<div className="text-center text-xs text-success">گزینه‌های این زبان آماده شد، می‌توانید ادامه دهید</div>
			)}
		</div>
	);
}
