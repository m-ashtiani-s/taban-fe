/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	// بیس استوریج مینیو: تصاویر با بیس داخلی ذخیره می‌شوند و در فرانت با بیس عمومی نمایش داده می‌شوند
	env: {
		MINIO_SOURCE_URL: `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}` || "http://localhost:9000/uploads-rasmiyab",
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
		];
	},
	async redirects() {
		return [
			{
				source: "/:path*",
				has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
				destination: "https://rasmiyab.com/:path*",
				permanent: true,
			},
		];
	},
	// async redirects() {
	// 	return [
	// 		{
	// 			source: "/",
	// 			destination: "/home",
	// 			permanent: true,
	// 		},
	// 	];
	// },
};

export default nextConfig;
