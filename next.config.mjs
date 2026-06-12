/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
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
