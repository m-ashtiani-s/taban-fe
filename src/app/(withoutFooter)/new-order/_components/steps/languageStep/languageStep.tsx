"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { IconTranslate } from "@/app/_components/icon/icons";
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

export default function LanguageStep({ rates, onSelectLanguage }: LanguageStepProps) {
	const { order } = useNewOrderStore();

	const languagesQuery = useQuery({
		queryKey: ["languages", "list"],
		queryFn: () => withMappedError(() => TranslationEndpoints.getLanguages()),
		retry: false,
	});

	const list = languagesQuery.data?.data ?? [];

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="زبان ترجمه را انتخاب کنید"
				subtitle="مدارک شما به زبان انتخابی ترجمه خواهد شد"
			/>

			{languagesQuery.isFetching ? (
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
			) : !!languagesQuery.error && isRetryAble(languagesQuery.error.code) ? (
				<ErrorComponent executeFunction={() => languagesQuery.refetch()} ticketAble errorText="دریافت لیست زبان‌ها با خطا مواجه شد." />
			) : (
				<div className="text-center text-sm text-neutral-400 py-10">داده‌ای موجود نیست</div>
			)}

			{/* نوع ترجمه به‌صورت پیش‌فرض «رسمی» است و فعلاً از کاربر پرسیده نمی‌شود (مخفی) */}

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
