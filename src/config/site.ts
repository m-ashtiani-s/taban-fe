import { SITE_URL } from "./global";

/**
 * ثابت‌های مرکزی هویت سایت برای استفاده در متادیتا، sitemap، robots و structured data.
 * منبع واحد تا عنوان/برند در همه‌جا یکدست بماند.
 */
export const SITE_NAME = "رسمی‌یاب";
export const SITE_TITLE = "رسمی‌یاب | پلتفرم آنلاین ترجمه رسمی";
export const SITE_DESCRIPTION =
	"رسمی‌یاب؛ دارالترجمه آنلاین رسمی. ثبت سفارش ترجمه‌ی رسمی مدارک به‌صورت آنلاین، با قیمت شفاف، مهر و تاییدات رسمی و تحویل سریع در سراسر کشور.";

/** آدرس پایه‌ی سایت (با fallback تا در نبود env هم build/runtime نشکند) */
export const SITE_BASE_URL = (SITE_URL || "https://rasmiyab.com").replace(/\/$/, "");
