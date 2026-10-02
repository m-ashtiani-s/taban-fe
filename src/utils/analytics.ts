import { AnalyticsEvent, AnalyticsParams } from "@/types/analytics.type";

// اسکریپت Umami صف داخلی ندارد؛ رویدادهای پیش از بار شدنش اینجا می‌مانند و با onLoad ارسال می‌شوند
// (سقف دارد چون وقتی Umami اصلاً پیکربندی نشده، کسی صف را خالی نمی‌کند)
const pendingUmamiEvents: [AnalyticsEvent, Record<string, unknown>][] = [];

/**
 * تنها نقطه‌ی ارسال رویداد آنالیتیکس؛ تعویض یا افزودن ابزار فقط همین‌جا تغییر می‌کند.
 * وقتی آنالیتیکس فعال نیست (استیجینگ، محیط محلی یا قبل از لانچ) هیچ کاری نمی‌کند.
 */
export function track(event: AnalyticsEvent, params: AnalyticsParams = {}) {
	if (typeof window === "undefined") return;
	const payload = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));
	try {
		window.gtag?.("event", event, { ...payload, transport_type: "beacon" });
		if (window.umami) window.umami.track(event, payload);
		else if (pendingUmamiEvents.length < 50) pendingUmamiEvents.push([event, payload]);
	} catch {}
}

export function flushUmamiQueue() {
	if (typeof window === "undefined" || !window.umami) return;
	while (pendingUmamiEvents.length) {
		const [event, payload] = pendingUmamiEvents.shift()!;
		try {
			window.umami.track(event, payload);
		} catch {}
	}
}

/** مبالغ سامانه به تومان است و GA4 برای IRR ریال می‌خواهد */
export function tomanToRial(amount?: number | null): number | undefined {
	return typeof amount === "number" && Number.isFinite(amount) ? amount * 10 : undefined;
}

/** purchase باید برای هر سفارش فقط یک‌بار ثبت شود (رفرش صفحه‌ی نتیجه‌ی پرداخت دوباره ثبتش نکند) */
export function trackOnce(key: string, event: AnalyticsEvent, params: AnalyticsParams = {}) {
	if (typeof window === "undefined") return;
	const storageKey = `analytics:${event}:${key}`;
	try {
		if (localStorage.getItem(storageKey)) return;
		localStorage.setItem(storageKey, "1");
	} catch {}
	track(event, params);
}
