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
