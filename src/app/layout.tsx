"use client";

import { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";
import "../styles/globals.css";
import "./globals.css";
import { Header } from "./_components/header/header";
import { Footer } from "./_components/footer/footer";
import { Notifications } from "./_components/notification/notification";
import { AuthGuard } from "./_components/authGuard/authGuard";
import { useProfiletore } from "@/stores/profile";
import { Profile } from "@/types/profile.type";
import { Res } from "@/types/responseType";
import { API_URL } from "@/config/global";
import { readData } from "@/core/http-service/http-service";
import { useEffect } from "react";
import { useCartStore } from "@/stores/cart";
import { Cart } from "@/types/cart.type";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";
import { TabanEndpoints } from "./_api/endpoints";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "red" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const { profile, setProfile } = useProfiletore();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const { result: profileResult, fetchData: executeProfile } = useApi(async () => await TabanEndpoints.getProfile());

	useEffect(() => {
		executeProfile();
	}, []);

	useEffect(() => {
		if (profileResult) {
			if (profileResult?.success) {
				setProfile(profileResult?.data?.data);
			} else {
				setProfile(null);
				profileResult?.statusCode !== 401 &&
					showNotification({
						type: "error",
						message: profileResult?.description ?? "دریافت پروفایل با خطا مواجه شد",
					});
			}
		}
	}, [profileResult]);

	return (
		<html dir="rtl">
			<head>
				<link rel="icon" href="/images/logo.svg" />
				<meta name="theme-color" content="#f5a900" />
				{/* <title>معماریاب | پلتفرمم بزرگ معماری</title> */}
			</head>
			<body className="content-center bg-white text-primary">
				<Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
					<NextTopLoader
						color="#f5a900"
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
					<Notifications />
					{children}
				</Providers>
			</body>
		</html>
	);
}
