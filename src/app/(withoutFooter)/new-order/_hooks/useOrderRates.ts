"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { RateFilters } from "@/types/rateFilters.type";
import { Result, ResultError } from "@/types/result";
import { StepKey } from "../_config/steps";

type ScanFilters = { translationItemId?: string };

/** بازسازی همان شکلِ `Result` که کامپوننت‌ها انتظار دارند (`result?.success` / `result.data?.data`) از خروجی کوئری */
function toRateResult<T>(data: T | undefined, error: ResultError | null): Result<T> | null {
	if (data !== undefined) return { success: true, data };
	if (error) return error;
	return null;
}

/**
 * فچ مرکزیِ همه‌ی نرخ‌های وابسته به (مدرک، زبان).
 *
 * در فلوی صفحه‌ای قدیمی این چهار درخواست در هر صفحه دوباره ارسال می‌شد. چون
 * ورودی آن‌ها فقط مدرک و زبان است و بعد از انتخاب زبان ثابت می‌ماند، اینجا یک‌بار
 * فچ می‌شوند و بین تمام مراحل به اشتراک گذاشته می‌شوند. همین نتایج مبنای محاسبه‌ی
 * توالی داینامیک مراحل هم هستند.
 *
 * فچ‌ها imperative اند (با `fetchAll`) نه declarative: فیلترها را به‌عنوان state نگه
 * می‌داریم و کوئری‌ها فقط وقتی فعال می‌شوند که `fetchAll` آن‌ها را ست کند. `fetchToken`
 * تضمین می‌کند حتی اگر `fetchAll` با همان ترکیب (force/تلاش مجدد) صدا زده شود، درخواست
 * دوباره ارسال شود.
 */
export function useOrderRates() {
	const [filters, setFilters] = useState<RateFilters | null>(null);
	const [scanFilters, setScanFilters] = useState<ScanFilters | null>(null);
	const [attempted, setAttempted] = useState(false);
	const [fetchToken, setFetchToken] = useState(0);

	const lastKey = useRef<string>("");
	const baseRateQuery = useQuery({
		queryKey: ["orderRates", "baseRate", fetchToken, filters],
		queryFn: () => withMappedError(() => TranslationEndpoints.getBaseRate(filters)),
		enabled: !!filters,
		retry: false,
	});
	const dynamicRatesQuery = useQuery({
		queryKey: ["orderRates", "dynamicRates", fetchToken, filters],
		queryFn: () => withMappedError(() => TranslationEndpoints.getDynamicRates(filters)),
		enabled: !!filters,
		retry: false,
	});
	const certificationsQuery = useQuery({
		queryKey: ["orderRates", "certifications", fetchToken, filters],
		queryFn: () => withMappedError(() => TranslationEndpoints.getCertificationRates(filters)),
		enabled: !!filters,
		retry: false,
	});
	const justiceInquiriesQuery = useQuery({
		queryKey: ["orderRates", "justiceInquiries", fetchToken, filters],
		queryFn: () => withMappedError(() => TranslationEndpoints.getJusticeInquiriesRates(filters)),
		enabled: !!filters,
		retry: false,
	});
	const embassiesQuery = useQuery({
		queryKey: ["orderRates", "embassies", fetchToken, filters],
		queryFn: () => withMappedError(() => TranslationEndpoints.getEmbassyRates(filters)),
		enabled: !!filters,
		retry: false,
	});
	const scanRatesQuery = useQuery({
		queryKey: ["orderRates", "scanRates", fetchToken, scanFilters],
		queryFn: () => withMappedError(() => TranslationEndpoints.getScanRates(scanFilters)),
		enabled: !!scanFilters,
		retry: false,
	});

	const baseResult = useMemo(() => toRateResult(baseRateQuery.data, baseRateQuery.error), [baseRateQuery.data, baseRateQuery.error]);
	const dynamicResult = useMemo(() => toRateResult(dynamicRatesQuery.data, dynamicRatesQuery.error), [dynamicRatesQuery.data, dynamicRatesQuery.error]);
	const certificationsResult = useMemo(() => toRateResult(certificationsQuery.data, certificationsQuery.error), [certificationsQuery.data, certificationsQuery.error]);
	const justiceInquiriesResult = useMemo(() => toRateResult(justiceInquiriesQuery.data, justiceInquiriesQuery.error), [justiceInquiriesQuery.data, justiceInquiriesQuery.error]);
	const embassiesResult = useMemo(() => toRateResult(embassiesQuery.data, embassiesQuery.error), [embassiesQuery.data, embassiesQuery.error]);
	const scanResult = useMemo(() => toRateResult(scanRatesQuery.data, scanRatesQuery.error), [scanRatesQuery.data, scanRatesQuery.error]);

	const baseRate = { result: baseResult, loading: baseRateQuery.isFetching };
	const dynamicRates = { result: dynamicResult, loading: dynamicRatesQuery.isFetching };
	const certifications = { result: certificationsResult, loading: certificationsQuery.isFetching };
	const justiceInquiries = { result: justiceInquiriesResult, loading: justiceInquiriesQuery.isFetching };
	const embassies = { result: embassiesResult, loading: embassiesQuery.isFetching };
	const scanRates = { result: scanResult, loading: scanRatesQuery.isFetching };

	const fetchAll = useCallback(
		(translationItemId: string, languageId: string, force = false) => {
			const key = `${translationItemId}-${languageId}`;
			if (!force && key === lastKey.current) return;
			lastKey.current = key;
			setAttempted(true);
			setFilters({ translationItemId, languageId });
			// نرخ اسکن فقط به مدرک وابسته است، نه به زبان
			setScanFilters({ translationItemId });
			setFetchToken((t) => t + 1);
		},
		[]
	);

	const reset = useCallback(() => {
		lastKey.current = "";
		setAttempted(false);
		setFilters(null);
		setScanFilters(null);
	}, []);

	const loading =
		baseRateQuery.isFetching ||
		dynamicRatesQuery.isFetching ||
		certificationsQuery.isFetching ||
		justiceInquiriesQuery.isFetching ||
		embassiesQuery.isFetching ||
		scanRatesQuery.isFetching;
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
