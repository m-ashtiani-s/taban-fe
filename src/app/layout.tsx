import { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";
import "../styles/globals.css";
import "./globals.css";
import { Notifications } from "./_components/notification/notification";
import AppBootstrap from "./_components/appBootstrap/appBootstrap";
import TopBanner from "./_components/topBanner/topBanner";
import { SITE_BASE_URL, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_TITLE, buildSiteGraph } from "@/config/site";
import { ALLOW_INDEXING } from "@/config/global";
import { QueryProvider } from "./queryProvider";
import JsonLd from "./_components/jsonLd/jsonLd";
import Analytics from "./_components/analytics/analytics";
import { buildGaInitScript, getAnalyticsConfig } from "@/config/analytics";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_BASE_URL),
	title: {
		default: SITE_TITLE,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	openGraph: {
		type: "website",
		siteName: SITE_NAME,
		locale: SITE_LOCALE,
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
	},
	robots: ALLOW_INDEXING
		? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
		: { index: false, follow: false },
	verification: {
		google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
		other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
	},
};

export const viewport: Viewport = {
	themeColor: "#1a3047",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const analyticsConfig = getAnalyticsConfig();

	return (
		<html lang="fa" dir="rtl">
			<head>
				{/* فقط دو وزن: متن پیش‌فرض بدنه (یکان ۴۰۰) و تیتر هیرو/LCP (پیدا ۶۰۰)؛ بقیه‌ی وزن‌ها با swap بعداً می‌رسند */}
				<link rel="preload" href="/fonts/yekan-bakh/YekanBakh-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
				<link rel="preload" href="/fonts/peyda/woff2/PeydaWeb-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
				{analyticsConfig?.gaMeasurementId && <script dangerouslySetInnerHTML={{ __html: buildGaInitScript(analyticsConfig.gaMeasurementId) }} />}
			</head>
			<body className="content-center bg-white text-primary">
				<JsonLd data={buildSiteGraph()} />
				<QueryProvider>
					<Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
						<NextTopLoader
							color="#1a3047"
							initialPosition={0.08}
							crawlSpeed={200}
							height={4}
							crawl={true}
							showSpinner={false}
							easing="ease"
							speed={200}
							shadow="0 0 10px #2299DD,0 0 5px #2299DD"
							zIndex={1600}
							showAtBottom={false}
						/>
						<AppBootstrap />
						<Notifications />
						<TopBanner />
						{children}
						{analyticsConfig && <Analytics config={analyticsConfig} />}
					</Providers>
				</QueryProvider>
			</body>
		</html>
	);
}
