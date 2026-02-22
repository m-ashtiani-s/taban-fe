/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ayliweb.ir",
				port: "",
				pathname: "/**",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/wp-json/:path*",
				destination: "https://rasmiyab.ayliweb.ir/wp-json/:path*",
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
