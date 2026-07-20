import { mapError } from "@/httpClient/utils/mapError";

/**
 * ری‌اکت‌کوئری موفقیت/شکست را از throw شدن promise تشخیص می‌دهد، نه از فیلد success.
 * پس خطای خام باید به ResultError نگاشت و دوباره پرتاب شود.
 */
export async function withMappedError<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (err) {
		throw mapError(err);
	}
}
