import { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";
import "../styles/globals.css";
import "./globals.css";
import { Notifications } from "./_components/notification/notification";
import AppBootstrap from "./_components/appBootstrap/appBootstrap";
import TopBanner from "./_components/topBanner/topBanner";
import { SITE_BASE_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/config/site";
import { QueryProvider } from "./queryProvider";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_BASE_URL),
	title: {
		default: SITE_TITLE,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	alternates: { canonical: "/" },
	icons: { icon: "/images/logo2.svg" },
	openGraph: {
		type: "website",
		siteName: SITE_NAME,
		locale: "fa_IR",
		url: SITE_BASE_URL,
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
	},
	// نوایندکسِ سراسری: هیچ صفحه‌ای نباید ایندکس یا دنبال شود
	robots: {
		index: false,
		follow: false,
		googleBot: {
			index: false,
			follow: false,
		},
	},
};

export const viewport: Viewport = {
	themeColor: "#1a3047",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const organizationLd = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE_NAME,
		url: SITE_BASE_URL,
		logo: `${SITE_BASE_URL}/images/logo2.svg`,
	};

	const websiteLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE_NAME,
		url: SITE_BASE_URL,
		inLanguage: "fa-IR",
	};

	return (
		<html lang="fa" dir="rtl">
			<head></head>
			<body className="content-center bg-white text-primary">
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
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
					</Providers>
				</QueryProvider>
			</body>
		</html>
	);
}
