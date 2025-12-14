"use client";
import { useEffect, useState } from "react";
import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { useApi } from "@/hooks/useApi";
import { IconArrowLine, IconDocument, IconInquiry, IconJustice, IconMfa } from "@/app/_components/icon/icons";
import TabanLoading from "@/app/_components/common/tabanLoading.tsx/tabanLoading";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { motion } from "framer-motion";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { OrderState, useOrderStore } from "../_store/rate.store";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { RateFilters } from "../_types/rateFilters.type";
import SpecialsLoading from "./_components/justiceInquiriesLoading/justiceInquiriesLoading";
import { TranslationEndpoints } from "../_api/endpoints";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { SpecialItemsValue } from "../_types/createOrder.type";
import TabanCheckbox from "@/app/_components/common/tabanCheckbox/tabanCheckbox";
import { CertificationRate } from "../_types/certificationRate.type";
import { JusticeInquiryRate } from "../_types/justiceInquiry.type";

export default function Page() {
	const { order, setOrder }: OrderState = useOrderStore();
	const [specialItems, setSpecialItems] = useState<Record<string, string>>({});

	const {
		result: dynamicRatesResult,
		fetchData: executeDynamicRates,
		loading: dynamicRatesLoading,
	} = useApi(async (filters: RateFilters | null) => {
		return await TranslationEndpoints.getDynamicRates(filters);
	});
	const {
		result: certificationRatesResult,
		fetchData: executeCertificationRates,
		loading: certificationRatesLoading,
	} = useApi(async (filters: RateFilters | null) => {
		return await TranslationEndpoints.getCertificationRates(filters);
	});
	const {
		result: justiceInquiryRatesResult,
		fetchData: executeJusticeInquiryRates,
		loading: justiceInquiryRatesLoading,
	} = useApi(async (filters: RateFilters | null) => {
		return await TranslationEndpoints.getJusticeInquiriesRates(filters);
	});

	useEffect(() => {
		if (order?.language && order?.translationItem) {
			executeDynamicRates({ translationItemId: order?.translationItem?.translationItemId, languageId: order?.language?.languageId });
			executeCertificationRates({ translationItemId: order?.translationItem?.translationItemId, languageId: order?.language?.languageId });
			executeJusticeInquiryRates({ translationItemId: order?.translationItem?.translationItemId, languageId: order?.language?.languageId });
		}
	}, []);

	const justiceInquiryIsSelected = (id: string) => {
		return !!order?.justiceInquiriesItems?.some((it) => it?.justiceInquiryRateId === id);
	};

	const selectInquiryHandler = (justiceInquiry: JusticeInquiryRate) => {
		if (justiceInquiryIsSelected(justiceInquiry?.justiceInquiryRateId)) {
			const updatedArray = order?.justiceInquiriesItems?.filter(
				(item: JusticeInquiryRate) => item?.justiceInquiryRateId !== justiceInquiry?.justiceInquiryRateId
			);
			setOrder((prev) => ({ ...prev, justiceInquiriesItems: updatedArray }));
		} else {
			setOrder((prev) => ({ ...prev, justiceInquiriesItems: [...(prev?.justiceInquiriesItems ?? []), justiceInquiry] }));
		}
	};

	return (
		<div className="h-full">
			<div className="container h-full">
				<div className="flex border w-full border-neutral-300 rounded-lg p-4 h-[calc(100%-16px)] flex-col">
					<div className="flex flex-col h-[calc(100%-40px)] taban-scroll">
						<div className=" flex items-center gap-2 w-full px-8 pb-16 border-b border-dashed border-neutral-300">
							<CreateRateLevels activeLevel={5} />
						</div>

						<div className="pt-8">
							<div className="peyda font-extrabold text-3xl text-neutral-500 text-center w-full">
								اگر نیاز به استعلام خاصی دارید لطفا آنها را انتخاب کنید
							</div>
						</div>

						<div className="mt-4">
							{certificationRatesLoading ? (
								<SpecialsLoading />
							) : !!justiceInquiryRatesResult?.success && justiceInquiryRatesResult?.data?.data!?.length > 0 ? (
								<div className="flex flex-wrap">
									{justiceInquiryRatesResult?.data?.data!?.map((it) => (
										<motion.div
											className="p-2 w-6/12"
											initial={{ opacity: 0, y: 12 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												duration: 0.5,
												ease: "easeOut",
											}}
										>
											<div
												onClick={() => selectInquiryHandler(it)}
												className={`border border-neutral-300 rounded-lg cursor-pointer flex items-center justify-between p-4  duration-300 ${justiceInquiryIsSelected(it?.justiceInquiryRateId) ? "bg-secondary" : "hover:bg-secondary/10"}`}
											>
												<div
													className={`flex items-center gap-2 peyda font-semibold  ${justiceInquiryIsSelected(it?.justiceInquiryRateId) ? "text-white" : ""}`}
												>
													<IconInquiry
														width={48}
														height={48}
														viewBox="0 0 1024 1024"
														className={`fill-primary  ${justiceInquiryIsSelected(it?.justiceInquiryRateId) ? "fill-white stroke-0 stroke-white" : "stroke-0"}`}
													/>
													<div className="flex flex-col">
														<div className="text-lg peyda">
															{it?.justiceInquiryName}
														</div>
														<div
															className={`text-sm  ${justiceInquiryIsSelected(it?.justiceInquiryRateId) ? "text-white/80" : "text-primary/50"}`}
														>
															لورم اپسیوم متن ساختگی برای تست است
														</div>
													</div>
												</div>
												<div
													className={`flex items-center justify-center cursor-pointer relative text-sm gap-1 w-6 h-6 rounded-md border  ${justiceInquiryIsSelected(it?.justiceInquiryRateId) ? "bg-primary border-primary" : "border-primary/50"}`}
												>
													{justiceInquiryIsSelected(it?.justiceInquiryRateId) && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-3.5 w-3.5"
															viewBox="0 0 20 20"
															fill="white"
															stroke="white"
															stroke-width="1"
														>
															<path
																fill-rule="evenodd"
																d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																clip-rule="evenodd"
															></path>
														</svg>
													)}
												</div>
											</div>
										</motion.div>
									))}
								</div>
							) : !!certificationRatesResult &&
							  !certificationRatesResult?.success &&
							  isRetryAble(certificationRatesResult?.code) ? (
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
							isLink
							href={
								certificationRatesResult?.success && certificationRatesResult?.data?.data!?.length > 0
									? "/translation-order/translation-certifications"
									: dynamicRatesResult?.success && dynamicRatesResult?.data?.data!?.length > 0
										? "/translation-order/translation-specials"
										: "/translation-order/language"
							}
							variant="text"
						>
							مرحله قبلی
						</TabanButton>
						<TabanButton disabled={!order?.language} isLink href={"/translation-order/upload"} icon={<IconArrowLine />}>
							مرحله بعدی
						</TabanButton>
					</div>
				</div>
			</div>
		</div>
	);
}
