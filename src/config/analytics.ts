import { AnalyticsConfig } from "@/types/analytics.type";
import { ALLOW_INDEXING } from "./global";

/**
 * فقط-سروری: اسکریپت‌های آنالیتیکس فقط روی پروداکشنِ لانچ‌شده (ALLOW_INDEXING) یا با روشن کردن
 * صریح ANALYTICS_ENABLED بار می‌شوند تا داده‌ی استیجینگ و محیط محلی با داده‌ی واقعی قاطی نشود.
 */
export function getAnalyticsConfig(): AnalyticsConfig | null {
	const enabled = ALLOW_INDEXING || process.env.ANALYTICS_ENABLED === "true";
	if (!enabled) return null;

	const gaId = process.env.GA_MEASUREMENT_ID?.trim();
	const umamiScript = process.env.UMAMI_SCRIPT_URL?.trim();
	const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID?.trim();

	const config: AnalyticsConfig = {
		gaMeasurementId: gaId && /^G-[A-Z0-9]+$/.test(gaId) ? gaId : undefined,
		umami: umamiScript && umamiWebsiteId ? { scriptUrl: umamiScript, websiteId: umamiWebsiteId } : undefined,
	};
	return config.gaMeasurementId || config.umami ? config : null;
}

/**
 * gtag و config باید پیش از اجرای هر کد React تعریف شده باشند؛ وگرنه رویدادهایی که هنگام mount ثبت
 * می‌شوند (purchase، order_step_view) پیش از بار شدن اسکریپت گم می‌شوند. این بخش inline در head می‌آید
 * و فایل gtag.js همچنان afterInteractive بار می‌شود و صف dataLayer را به ترتیب ارسال می‌کند.
 */
export function buildGaInitScript(measurementId: string): string {
	return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}');`;
}
