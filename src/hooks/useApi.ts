
"use client";

import { mapError } from "@/httpClient/utils/mapError";
import { Result } from "@/types/result";
import { useState, useCallback, Dispatch, SetStateAction } from "react";

type UseApiReturn<T, A extends any[]> = {
	loading: boolean;
	result: Result<T> | null;
	/** رفتار قدیمی: استیت result را ست می‌کند، throw نمی‌کند و چیزی برنمی‌گرداند */
	fetchData: (...args: A) => Promise<void>;
	/** رفتار جدید: نتیجه‌ی خام T را برمی‌گرداند و در صورت خطا throw می‌کند */
	fetchDataStrict: (...args: A) => Promise<T>;
	/** رفتار جدید: Result<T> را برمی‌گرداند و throw نمی‌کند */
	fetchDataResult: (...args: A) => Promise<Result<T>>;
	setLoading: Dispatch<SetStateAction<boolean>>;
	/** اختیاری ولی مفید: اگر جایی خواستی result را دستی ست کنی */
	setResult: Dispatch<SetStateAction<Result<T> | null>>;
};

export function useApi<T, A extends any[]>(
	apiCall: (...args: A) => Promise<T>,
	initialLoading = false
): UseApiReturn<T, A> {
	const [loading, setLoading] = useState(initialLoading);
	const [result, setResult] = useState<Result<T> | null>(null);


	const fetchData = useCallback(
		async (...args: A) => {
			setLoading(true);
			try {
				const data = await apiCall(...args);
				setResult({ success: true, data });
			} catch (err) {
				const errorResult = mapError<T>(err);
				setResult(errorResult);
			} finally {
				setTimeout(() => setLoading(false), 100);
			}
		},
		[apiCall]
	);


	const fetchDataStrict = useCallback(
		async (...args: A): Promise<T> => {
			setLoading(true);
			try {
				const data = await apiCall(...args);
				setResult({ success: true, data });
				return data;
			} catch (err: any) {
				const errorResult = mapError<T>(err);
				setResult(errorResult);

				const enriched = err instanceof Error ? err : new Error(errorResult?.description || "Request failed");
				try {
					(enriched as any).code = (errorResult as any)?.code ?? (err?.code ?? err?.response?.data?.code);
					(enriched as any).status = err?.response?.status ?? (err?.status ?? undefined);
					(enriched as any).raw = (err?.response?.data ?? err?.data ?? err);
				} catch { }
				throw enriched;
			} finally {
				setTimeout(() => setLoading(false), 100);
			}
		},
		[apiCall]
	);


	const fetchDataResult = useCallback(
		async (...args: A): Promise<Result<T>> => {
			setLoading(true);
			try {
				const data = await apiCall(...args);
				const ok: Result<T> = { success: true, data };
				setResult(ok);
				return ok;
			} catch (err) {
				const errorResult = mapError<T>(err);
				setResult(errorResult);
				return errorResult;
			} finally {
				setTimeout(() => setLoading(false), 100);
			}
		},
		[apiCall]
	);

	return { loading, result, fetchData, fetchDataStrict, fetchDataResult, setLoading, setResult };
}
