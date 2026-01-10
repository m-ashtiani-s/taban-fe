"use client";
import { useEffect, useRef } from "react";
import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { useApi } from "@/hooks/useApi";
import { IconArrowLine, IconTranslate } from "@/app/_components/icon/icons";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { motion } from "framer-motion";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { OrderState, useOrderStore } from "../_store/rate.store";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import LanguagesLoading from "./_components/languagesLoading/languagesLoading";
import Image from "next/image";
import { RateFilters } from "../_types/rateFilters.type";
import { TranslationEndpoints } from "../_api/endpoints";

export default function Page() {
	const { order, setOrder }: OrderState = useOrderStore();
	const mount = useRef(false);
	const {
		result: dynamicRatesResult,
		fetchData: executeDynamicRates,
		loading: dynamicRatesLoading,
	} = useApi(async (filters: RateFilters | null) => {
		return await TranslationEndpoints.getDynamicRates(filters);
	});
	const {
		result: languagesResult,
		fetchData: executeLanguages,
		loading: languagesLoading,
	} = useApi(async () => await TranslationEndpoints.getLanguages(), true);
	const {
		result: baseRateResult,
		fetchData: executeBaseRate,
		loading: baseRateLoading,
	} = useApi(async (filters: RateFilters | null) => await TranslationEndpoints.getBaseRate(filters), true);

	useEffect(() => {
		executeLanguages();
		mount.current && setOrder((prev) => ({ ...prev, language: null }));
		setTimeout(() => {
			mount.current = true;
		}, 100);
	}, []);

	useEffect(() => {
		if (order?.language && order?.translationItem) {
			executeDynamicRates({ translationItemId: order?.translationItem?.translationItemId, languageId: order?.language?.languageId });
			executeBaseRate({ translationItemId: order?.translationItem?.translationItemId, languageId: order?.language?.languageId });
		}
	}, [order?.language]);

	useEffect(() => {
		if (baseRateResult) {
			if (baseRateResult?.success) {
				setOrder((prev) => ({ ...prev, baseRate: baseRateResult?.data?.data![0]?.basePrice ?? null }));
			} else {
			}
		}
	}, [baseRateResult]);

	return (
		<div className="h-full">
			<div className="container h-full">
				<div className="flex border w-full border-neutral-300 rounded-lg p-4 h-[calc(100%-16px)] flex-col">
					<div className="flex flex-col h-[calc(100%-40px)] taban-scroll">
						<div className=" flex items-center gap-2 w-full px-8 pb-16 border-b border-dashed border-neutral-300">
							<CreateRateLevels activeLevel={2} />
						</div>
						<div className="pt-8">
							<div className="peyda font-extrabold text-3xl text-neutral-500 text-center w-full">
								زبان مد نظر خود برای ترجمه را انتخاب کنید
							</div>
						</div>

						<div className="mt-4">
							{languagesLoading ? (
								<LanguagesLoading />
							) : !!languagesResult?.success && languagesResult?.data?.data!?.length > 0 ? (
								<div className="flex flex-wrap ">
									{languagesResult?.data?.data?.map((it, index) => (
										<motion.div
											className="p-2 w-3/12"
											key={it?.languageId}
											initial={{ opacity: 0, y: 12 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												duration: 0.5,
												ease: "easeOut",
												delay: index * 0.05,
											}}
										>
											<div
												onClick={() => {
													setOrder((prev) => ({ ...prev, language: it }));
												}}
												className={`border border-neutral-300 rounded-lg cursor-pointer flex items-center justify-between p-4  duration-300 ${order?.language?.languageId === it?.languageId ? "bg-secondary" : "hover:bg-secondary/10"}`}
											>
												<div
													className={`flex items-center gap-2 peyda font-semibold  ${order?.language?.languageId === it?.languageId ? "text-white" : ""}`}
												>
													<IconTranslate
														className={`fill-primary  ${order?.language?.languageId === it?.languageId ? "fill-white stroke-1 stroke-white" : "stroke-0"}`}
													/>
													{it?.languageName}
												</div>
												<div
													className={`rounded-lg px-2 ${order?.language?.languageId === it?.languageId ? "!bg-white !border-white" : ""}`}
												>
													<Image
														width={32}
														height={32}
														alt={""}
														src={`/images/languages/${it?.languageCode}.png`}
													/>
												</div>
											</div>
										</motion.div>
									))}
								</div>
							) : !!languagesResult && !languagesResult?.success && isRetryAble(languagesResult?.code) ? (
								<div className="flex justify-center gap-4 items-start mt-8 bg-white">
									<ErrorComponent
										executeFunction={() => executeLanguages()}
										ticketAble
										errorText="دریافت لیست مدارک با خطا مواجه شد."
									/>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-14 gap-4">
									<div className=" text-sm">داده‌ای موجود نیست</div>
								</div>
							)}
						</div>
					</div>
					<div className="flex items-center justify-end gap-2 pt-2 bg-white">
						<TabanButton isLink href="/translation-order/translation-item" variant="text">
							مرحله قبلی
						</TabanButton>
						<TabanButton
							disabled={!order?.language || !baseRateResult?.success}
							isLink
							href={
								dynamicRatesResult?.success && dynamicRatesResult?.data?.data!?.length > 0
									? "/translation-order/translation-specials"
									: "/translation-order/translation-certifications"
							}
							icon={<IconArrowLine />}
						>
							مرحله بعدی
						</TabanButton>
					</div>
				</div>
			</div>
		</div>
	);
}
