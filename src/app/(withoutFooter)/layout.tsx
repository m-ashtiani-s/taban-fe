"use client"
import { usePathname, useRouter } from "next/navigation";
import { Header } from "../_components/header/header";
import { useEffect } from "react";
import { OrderState, useOrderStore } from "./translation-order/_store/rate.store";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { order, setOrder }: OrderState = useOrderStore();
	const pathname = usePathname();
	const router = useRouter();
	useEffect(() => {
		setOrder(null);
		if (pathname !== "/translation-order/translation-item" && !order) {
			router.push("/translation-order/translation-item");
		}
	}, []);
	return (
		<>
			<Header />
			<div className="h-[calc(100dvh)] pt-[100px]">{children}</div>
		</>
	);
}
