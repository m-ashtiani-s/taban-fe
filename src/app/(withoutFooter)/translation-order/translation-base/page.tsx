"use client";
import { useEffect, useState } from "react";
import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { useApi } from "@/hooks/useApi";
import { IconArrowLine } from "@/app/_components/icon/icons";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { motion } from "framer-motion";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { OrderState, useOrderStore } from "../_store/rate.store";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { RateFilters } from "../_types/rateFilters.type";
import SpecialsLoading from "./_components/specialsLoading/specialsLoading";
import { TranslationEndpoints } from "../_api/endpoints";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";

export default function Page() {
	const { order, setOrder }: OrderState = useOrderStore();
	const [translationBase, setTranslationBase] = useState<Record<string, string>>({});
	const {
		result: dynamicRatesResult,
		fetchData: executeDynamicRates,
		loading: dynamicRatesLoading,
	} = useApi(async (filters: RateFilters | null) => {
		return await TranslationEndpoints.getDynamicRates(filters);
	});

	const {
		result: baseRateResult,
		fetchData: executeBaseRate,
		loading: baseRateLoading,
	} = useApi(async (filters: RateFilters | null) => await TranslationEndpoints.getBaseRate(filters), true);
	

	useEffect(() => {
		setOrder((prev)=>({...prev,baseRateCount:translationBase}))
	}, [translationBase]);

	useEffect(() => {
		if (order?.language && order?.translationItem) {
			executeBaseRate({ translationItemId: order?.translationItem?.translationItemId, languageId: order?.language?.languageId });
			executeDynamicRates({ translationItemId: order?.translationItem?.translationItemId, languageId: order?.language?.languageId });
		}
	}, []);
	
	console.log(order)

	return (
		<div className="h-full">
			<div className="container h-full">
				<div className="flex border w-full border-neutral-300 rounded-lg p-4 h-[calc(100%-16px)] flex-col">
					<div className="flex flex-col h-[calc(100%-40px)] taban-scroll">
						<div className=" flex items-center gap-2 w-full px-8 pb-16 border-b border-dashed border-neutral-300">
							<CreateRateLevels activeLevel={3} />
						</div>

						<div className="mt-4">
							{baseRateLoading ? (
								<SpecialsLoading />
							) : !!baseRateResult?.success && baseRateResult?.data?.data!?.length > 0 ? (
								<div className="flex flex-col gap-4">
									{Object.keys(order?.translationItemNames!)?.map((item, index) => (
										<div className="pb-4 border-b border-neutral-300 border-dashed">
											<div className="text-lg font-bold text-secondary flex items-center gap-1 px-1">
												<div className="w-3 h-3 rounded bg-primary/70 relative -top-0.5 rotate-45"></div>
												{baseRateResult?.success
													? baseRateResult?.data?.data![0]?.title
													: "عنوان پایه"}{" "}
												برای {order?.translationItemNames![item] ?? "مدرک"}
											</div>
											<div className="flex flex-wrap gap-6">
												<motion.div
													className="p-2 w-3/12"
													key={item}
													initial={{ opacity: 0, y: 12 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														duration: 0.5,
														ease: "easeOut",
														delay: index * 0.05,
													}}
												>
													<div className="flex flex-col gap-2">
														<div className="peyda font-bold text-base text-neutral-500">
															{baseRateResult?.success
																? baseRateResult?.data?.data![0]
																		?.title
																: "عنوان"}
														</div>
														<div className="flex gap-2 items-center">
															<div className="w-64">
																<TabanInput
																	isNumber
																	type="number"
																	value={
																		translationBase[
																			item
																		]
																	}
																	groupMode
																	setValue={
																		setTranslationBase
																	}
																	name={item}
																/>
															</div>
														</div>
													</div>
												</motion.div>
											</div>
										</div>
									))}
								</div>
							) : !!baseRateResult && !baseRateResult?.success && isRetryAble(baseRateResult?.code) ? (
								<div className="flex justify-center gap-4 items-start mt-8 bg-white">
									<ErrorComponent
										executeFunction={() =>
											executeDynamicRates({
												translationItemId: order?.translationItem?.translationItemId,
												languageId: order?.language?.languageId,
											})
										}
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
						<TabanButton
							disabled={!order?.baseRateCount || !baseRateResult?.success}
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
