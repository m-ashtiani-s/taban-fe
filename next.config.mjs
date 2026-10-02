const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rasmiyab.com").replace(/\/$/, "");
const SITE_HOST = new URL(SITE_URL).host;

// صفحات فرود مدرک: آدرس عمومی فارسی است ولی Next 14 پوشه‌ی غیرلاتین را match نمی‌کند، پس روت داخلی
// لاتین است و با rewrite سرو می‌شود (هم‌مقدار با DOC_LANDINGS_BASE_PATH در src/config/docLandings.ts)
const DOC_LANDINGS_PUBLIC_PATH = encodeURI("/ترجمه-رسمی");
const DOC_LANDINGS_INTERNAL_PATH = "/official-translation";

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	poweredByHeader: false,
	// بیس استوریج مینیو: تصاویر با بیس داخلی ذخیره می‌شوند و در فرانت با بیس عمومی نمایش داده می‌شوند
	env: {
		MINIO_SOURCE_URL:
			process.env.MINIO_ENDPOINT && process.env.MINIO_BUCKET
				? `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}`
				: "http://localhost:9000/uploads-rasmiyab",
		MINIO_PUBLIC_URL: "https://media.rasmiyab.com",
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "rasmiyab.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "minio.rasmiyab.com",
				port: "",
				pathname: "/**",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/wp-json/:path*",
				destination: "https://wp.rasmiyab.com/wp-json/:path*",
			},
			{ source: DOC_LANDINGS_PUBLIC_PATH, destination: DOC_LANDINGS_INTERNAL_PATH },
			{ source: `${DOC_LANDINGS_PUBLIC_PATH}/:slug`, destination: `${DOC_LANDINGS_INTERNAL_PATH}/:slug` },
		];
	},
	async redirects() {
		// هر چهار شکل http/https و با/بدون www با یک ریدایرکت ۳۰۱ (نه زنجیره) به آدرس canonical می‌رسند
		const canonicalRedirects = [
			{
				source: "/:path*",
				has: [{ type: "host", value: `www.${SITE_HOST}` }],
				destination: `${SITE_URL}/:path*`,
				statusCode: 301,
			},
			// دسترسی مستقیم به روت داخلی لاتین نسخه‌ی تکراری می‌سازد؛ به آدرس فارسی canonical می‌رود
			{ source: DOC_LANDINGS_INTERNAL_PATH, destination: DOC_LANDINGS_PUBLIC_PATH, statusCode: 301 },
			{ source: `${DOC_LANDINGS_INTERNAL_PATH}/:slug`, destination: `${DOC_LANDINGS_PUBLIC_PATH}/:slug`, statusCode: 301 },
		];
		if (SITE_URL.startsWith("https://")) {
			canonicalRedirects.push({
				source: "/:path*",
				has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
				destination: `${SITE_URL}/:path*`,
				statusCode: 301,
			});
		}
		return canonicalRedirects;
	},
	async headers() {
		// نام فایل فونت‌ها با تغییر محتوا عوض می‌شود، پس کش طولانی و immutable امن است
		return [
			{
				source: "/fonts/:path*",
				headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
			},
		];
	},
};

export default nextConfig;
