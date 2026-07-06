// بیس‌ها از next.config.mjs (بخش env) خوانده می‌شوند
const MINIO_SOURCE_URL = process.env.MINIO_SOURCE_URL || "http://localhost:9000";
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "https://media.rasmiyab.com";

/** جایگزینی بیس در تمام مقادیرِ رشته‌ایِ یک ساختار (بازگشتی)؛ ساختار داده تغییر نمی‌کند */
function deepReplaceBase(data: any, from: string, to: string): any {
	if (data == null) return data;
	if (typeof data === "string") return data.startsWith(from) ? to + data.slice(from.length) : data;
	if (Array.isArray(data)) return data.map((d) => deepReplaceBase(d, from, to));
	if (typeof data === "object") {
		if (typeof Blob !== "undefined" && data instanceof Blob) return data;
		if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) return data;
		const out: Record<string, any> = {};
		for (const k of Object.keys(data)) out[k] = deepReplaceBase(data[k], from, to);
		return out;
	}
	return data;
}

/**
 * بیس داخلی مینیو را در کل بدنه‌ی پاسخ با بیس عمومی جایگزین می‌کند (برای نمایش تصاویر).
 * این تابع یک‌جا در interceptor پاسخِ HttpClient استفاده می‌شود؛ نیازی به تغییر کامپوننت‌ها نیست.
 */
export function rewriteImageUrlsToPublic<T>(data: T): T {
	return deepReplaceBase(data, MINIO_SOURCE_URL, MINIO_PUBLIC_URL);
}

/** جایگزینی بیس برای یک URL منفرد (در صورت نیاز به استفاده‌ی مستقیم) */
export function resolveImageUrl(url?: string | null): string {
	if (!url) return "";
	if (MINIO_SOURCE_URL && url.startsWith(MINIO_SOURCE_URL)) {
		return `${MINIO_PUBLIC_URL}${url.slice(MINIO_SOURCE_URL.length)}`;
	}
	return url.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):9000/i, MINIO_PUBLIC_URL);
}
