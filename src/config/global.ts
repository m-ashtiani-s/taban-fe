export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const WP_URL = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/+$/, "");
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// فقط-سروری و عمداً بدون NEXT_PUBLIC_: پیش‌فرض بسته است و فقط مقدار دقیق "true" سایت را
// برای موتورهای جست‌وجو باز می‌کند تا استیجینگ و پیش‌نمایش هرگز ایندکس نشوند.
// robots.txt استاتیک ساخته می‌شود، پس تغییر این مقدار یک بیلد/دیپلوی تازه می‌خواهد.
export const ALLOW_INDEXING = process.env.ALLOW_INDEXING === "true";
