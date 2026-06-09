"use client";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "../_components/header/header";
import { useEffect } from "react";
import { OrderState, useOrderStore } from "@/stores/rate.store";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { order, setOrder }: OrderState = useOrderStore();
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		setOrder({
			translationItemCount: 1,
			translationItem: null,
			language: null,
			baseRateCount: {},
			translationItemNames: {},
			specialItems: [],
			justiceInquiriesItems: [],
			mfaCertification: [],
			justiceCertification: [],
			passports: [],
			assets: [],
		});
		if (pathname !== "/new-order" && !pathname.startsWith("/new-order") && !order) {
			router.push("/new-order");
		}
	}, []);

	return (
		<>
			<Header />
			<div className="h-[calc(100dvh)] pt-[72px]">{children}</div>
		</>
	);
}
