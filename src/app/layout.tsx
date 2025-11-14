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

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "red" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const { profile, setProfile } = useProfiletore();
	const { cart, setCart, cartLoading, setCartLoading } = useCartStore();

	useEffect(() => {
		executeProfile();
		executeCart();
	}, []);
	const executeProfile = async () => {
		try {
			const res = await readData<Res<Profile>>(`${API_URL}v1/user`);
			setProfile(res?.data);
		} catch (error: any) {
			console.warn(error);
			setProfile(null);
			error?.code === 401 && storage.remove(StorageKey?.TOKEN);
		} finally {
		}
	};
	const executeCart = async () => {
		try {
			setCartLoading(true);
			const res = await readData<Res<Cart>>(`${API_URL}v1/user/cart`);
			setCart(res?.data);
		} catch (error: any) {
			console.warn(error);
			setCart(null);
		} finally {
			setCartLoading(false);
		}
	};
	return (
		<html dir="rtl">
			<head>
				<link rel="icon" href="/images/logo.svg" />
				<meta name="theme-color" content="#f5a900" />
				<title>معماریاب | پلتفرمم بزرگ معماری</title>
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
