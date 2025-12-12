"use client";
import { useEffect, useState } from "react";
import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { useApi } from "@/hooks/useApi";
import { IconArrowLine, IconDocument, IconJustice, IconMfa } from "@/app/_components/icon/icons";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { motion } from "framer-motion";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { OrderState, useOrderStore } from "../_store/rate.store";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { RateFilters } from "../_types/rateFilters.type";
import SpecialsLoading from "./_components/specialsLoading/specialsLoading";
import { TranslationEndpoints } from "../_api/endpoints";

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

	const selectCertificationHandler = (certificationType: "justice" | "mfa") => {
		if (certificationType === "justice" && certificationRatesResult?.success) {
			const rate = certificationRatesResult?.data?.data![0] ?? null;
			if (rate) {
				if (!order?.justiceCertification) {
					setOrder((prev) => ({ ...prev, justiceCertification: { price: rate?.justicePrice } }));
				} else {
					setOrder((prev) => ({ ...prev, justiceCertification: null }));
				}
			}
		} else if (certificationType === "mfa" && certificationRatesResult?.success) {
			const rate = certificationRatesResult?.data?.data![0] ?? null;
			if (rate) {
				if (!order?.mfaCertification) {
					setOrder((prev) => ({ ...prev, mfaCertification: { price: rate?.mfaPrice } }));
				} else {
					setOrder((prev) => ({ ...prev, mfaCertification: null }));
				}
			}
		}
	};

	return (
		<div className="h-full">
			<div className="container h-full">
				<div className="flex border w-full border-neutral-300 rounded-lg p-4 h-[calc(100%-16px)] flex-col">
					<div className="flex flex-col h-[calc(100%-40px)] taban-scroll">
						<div className=" flex items-center gap-2 w-full px-8 pb-16 border-b border-dashed border-neutral-300">
							<CreateRateLevels activeLevel={4} />
						</div>

						<div className="pt-8">
							<div className="peyda font-extrabold text-3xl text-neutral-500 text-center w-full">
								مهر و تاییدات ترجمه را انتخاب کنید
							</div>
						</div>

						<div className="mt-4">
							{certificationRatesLoading ? (
								<SpecialsLoading />
							) : !!certificationRatesResult?.success && certificationRatesResult?.data?.data!?.length > 0 ? (
								<div className="flex flex-wrap">
									<motion.div
										className="p-4 w-6/12"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.5,
											ease: "easeOut",
										}}
									>
										<div
											onClick={() => selectCertificationHandler("justice")}
											className={`border border-neutral-300 rounded-lg cursor-pointer flex items-center justify-between p-4  duration-300 ${!!order?.justiceCertification ? "bg-secondary" : "hover:bg-secondary/10"}`}
										>
											<div
												className={`flex items-center gap-2 peyda font-semibold  ${!!order?.justiceCertification ? "text-white" : ""}`}
											>
												<IconJustice
													width={48}
													height={48}
													viewBox="0 0 48 48"
													className={`fill-primary  ${!!order?.justiceCertification ? "fill-white stroke-0 stroke-white" : "stroke-0"}`}
												/>
												<div className="flex flex-col">
													<div className="text-lg peyda"> مهر دادگستری</div>
													<div className={`text-sm  ${!!order?.justiceCertification ? "text-white/80" : "text-primary/50"}`} >لورم اپسیوم متن ساختگی برای تست است</div>
												</div>
											</div>
											<div
												className={`flex items-center justify-center cursor-pointer relative text-sm gap-1 w-6 h-6 rounded-md border  ${!!order?.justiceCertification ? "bg-primary border-primary" : "border-primary/50"}`}
											>
												{!!order?.justiceCertification && (
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
									<motion.div
										className="p-4 w-6/12"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.5,
											ease: "easeOut",
										}}
									>
										<div
											onClick={() => selectCertificationHandler("mfa")}
											className={`border border-neutral-300 rounded-lg cursor-pointer flex items-center justify-between p-4  duration-300 ${!!order?.mfaCertification ? "bg-secondary" : "hover:bg-secondary/10"}`}
										>
											<div
												className={`flex items-center gap-2 peyda font-semibold  ${!!order?.mfaCertification ? "text-white" : ""}`}
											>
												<IconMfa
													width={40}
													height={40}
													className={`stroke-primary  ${!!order?.mfaCertification ? "!stroke-white " : ""}`}
												/>
												<div className="flex flex-col">
													<div className="text-lg peyda"> مهر وزارت امور خارجه</div>
													<div className={`text-sm  ${!!order?.mfaCertification ? "text-white/80" : "text-primary/50"}`} >لورم اپسیوم متن ساختگی برای تست است</div>
												</div>
											</div>
											<div
												className={`flex items-center justify-center cursor-pointer relative text-sm gap-1 w-6 h-6 rounded-md border  ${!!order?.mfaCertification ? "bg-primary border-primary" : "border-primary/50"}`}
											>
												{!!order?.mfaCertification && (
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
								dynamicRatesResult?.success && dynamicRatesResult?.data?.data!?.length > 0
									? "/translation-order/translation-specials"
									: "/translation-order/translation-certifications"
							}
							variant="text"
						>
							مرحله قبلی
						</TabanButton>
						<TabanButton
							disabled={!order?.language}
							isLink
							href={
								justiceInquiryRatesResult?.success && justiceInquiryRatesResult?.data?.data!?.length > 0
									? "/translation-order/justice-inquiries"
									: "/translation-order/upload"
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
