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
import Upload from "./_components/upload";

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
							<CreateRateLevels activeLevel={7} />
						</div>

						<div className="pt-8">
							<div className="peyda font-extrabold text-3xl text-neutral-500 text-center w-full">
								آپلود مدارک و اسناد مورد نیاز
							</div>
						</div>

						<div className="mt-4">
							<div className="flex flex-wrap">
								<Upload />
							</div>
						</div>
					</div>
					<div className="flex items-center justify-end gap-2 pt-2 bg-white">
						<TabanButton
							isLink
							href={
								justiceInquiryRatesResult?.success && justiceInquiryRatesResult?.data?.data!?.length > 0
									? "/translation-order/justice-inquiries"
									: certificationRatesResult?.success && certificationRatesResult?.data?.data!?.length > 0
										? "/translation-order/translation-certifications"
										: dynamicRatesResult?.success && dynamicRatesResult?.data?.data!?.length > 0
											? "/translation-order/translation-specials"
											: "/translation-order/language"
							}
							variant="text"
						>
							مرحله قبلی
						</TabanButton>
						<TabanButton disabled={!order?.language} isLink href="/translation-order/checkout" icon={<IconArrowLine />}>
							مرحله بعدی
						</TabanButton>
					</div>
				</div>
			</div>
		</div>
	);
}
