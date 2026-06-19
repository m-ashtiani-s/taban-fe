"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { RateFilters } from "@/types/rateFilters.type";
import { StepKey } from "../_config/steps";

/**
 * فچ مرکزیِ همه‌ی نرخ‌های وابسته به (مدرک، زبان).
 *
 * در فلوی صفحه‌ای قدیمی این چهار درخواست در هر صفحه دوباره ارسال می‌شد. چون
 * ورودی آن‌ها فقط مدرک و زبان است و بعد از انتخاب زبان ثابت می‌ماند، اینجا یک‌بار
 * فچ می‌شوند و بین تمام مراحل به اشتراک گذاشته می‌شوند. همین نتایج مبنای محاسبه‌ی
 * توالی داینامیک مراحل هم هستند.
 */
export function useOrderRates() {
	const baseRate = useApi(async (filters: RateFilters | null) => await TranslationEndpoints.getBaseRate(filters));
	const dynamicRates = useApi(async (filters: RateFilters | null) => await TranslationEndpoints.getDynamicRates(filters));
	const certifications = useApi(async (filters: RateFilters | null) => await TranslationEndpoints.getCertificationRates(filters));
	const justiceInquiries = useApi(async (filters: RateFilters | null) => await TranslationEndpoints.getJusticeInquiriesRates(filters));
	const embassies = useApi(async (filters: RateFilters | null) => await TranslationEndpoints.getEmbassyRates(filters));
	const scanRates = useApi(async (filters: { translationItemId?: string } | null) => await TranslationEndpoints.getScanRates(filters));

	const [attempted, setAttempted] = useState(false);
	const lastKey = useRef<string>("");

	const fetchAll = useCallback(
		(translationItemId: string, languageId: string, force = false) => {
			const key = `${translationItemId}-${languageId}`;
			if (!force && key === lastKey.current) return;
			lastKey.current = key;
			const filters: RateFilters = { translationItemId, languageId };
			setAttempted(true);
			baseRate.fetchData(filters);
			dynamicRates.fetchData(filters);
			certifications.fetchData(filters);
			justiceInquiries.fetchData(filters);
			embassies.fetchData(filters);
			// نرخ اسکن فقط به مدرک وابسته است، نه به زبان
			scanRates.fetchData({ translationItemId });
		},
		[baseRate, dynamicRates, certifications, justiceInquiries, embassies, scanRates]
	);

	const reset = useCallback(() => {
		lastKey.current = "";
		setAttempted(false);
		baseRate.setResult(null);
		dynamicRates.setResult(null);
		certifications.setResult(null);
		justiceInquiries.setResult(null);
		embassies.setResult(null);
		scanRates.setResult(null);
	}, [baseRate, dynamicRates, certifications, justiceInquiries, embassies, scanRates]);

	const loading = baseRate.loading || dynamicRates.loading || certifications.loading || justiceInquiries.loading || embassies.loading || scanRates.loading;
	const ready = attempted && !loading;

	const retryAll = useCallback(() => {
		if (lastKey.current) {
			const [translationItemId, languageId] = lastKey.current.split("-");
			fetchAll(translationItemId, languageId, true);
		}
	}, [fetchAll]);

	const hasBase = useMemo(
		() => !!(baseRate.result?.success && baseRate.result.data?.data?.[0]?.title),
		[baseRate.result]
	);
	const hasSpecials = useMemo(
		() => !!(dynamicRates.result?.success && (dynamicRates.result.data?.data?.length ?? 0) > 0),
		[dynamicRates.result]
	);
	const hasInquiries = useMemo(
		() => !!(justiceInquiries.result?.success && (justiceInquiries.result.data?.data?.length ?? 0) > 0),
		[justiceInquiries.result]
	);
	const hasEmbassy = useMemo(
		() => !!(embassies.result?.success && (embassies.result.data?.data?.length ?? 0) > 0),
		[embassies.result]
	);
	const hasScan = useMemo(
		() => !!(scanRates.result?.success && (scanRates.result.data?.data?.length ?? 0) > 0),
		[scanRates.result]
	);

	/** توالی مراحل دقیقا مطابق منطق ناوبری فلوی قدیمی */
	const steps = useMemo<StepKey[]>(() => {
		const list: StepKey[] = ["selectItem", "naming", "language"];
		if (hasBase) list.push("base");
		if (hasSpecials) list.push("specials");
		list.push("certifications");
		if (hasInquiries) list.push("inquiries");
		if (hasEmbassy) list.push("embassy");
		list.push("upload", "passport", "copies");
		if (hasScan) list.push("scan");
		list.push("checkout");
		return list;
	}, [hasBase, hasSpecials, hasInquiries, hasEmbassy, hasScan]);

	return {
		baseRate,
		dynamicRates,
		certifications,
		justiceInquiries,
		embassies,
		scanRates,
		fetchAll,
		retryAll,
		reset,
		loading,
		ready,
		attempted,
		hasBase,
		hasSpecials,
		hasInquiries,
		hasEmbassy,
		hasScan,
		steps,
	};
}

export type OrderRates = ReturnType<typeof useOrderRates>;
