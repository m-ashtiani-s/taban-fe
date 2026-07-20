"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconCart, IconCircleUser, IconHome, IconTranslate } from "@/app/_components/icon/icons";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { withMappedError } from "@/utils/withMappedError";
import { useProfiletore } from "@/stores/profile";

export default function BottomNav() {
	const pathname = usePathname();
	const profile = useProfiletore((state) => state.profile);

	const cartQuery = useQuery({
		queryKey: ["cart", "detail"],
		queryFn: () => withMappedError(() => CartEndpoints.getCart()),
		enabled: !!profile,
		staleTime: 3_000,
	});

	const cartCount = cartQuery.data?.data?.items?.length ?? 0;
	if (pathname.startsWith("/new-order")) return null;

	const items = [
		{
			key: "home",
			label: "خانه",
			href: "/",
			icon: IconHome,
			isActive: pathname === "/",
			badge: 0,
		},
		{
			key: "cart",
			label: "سبد خرید",
			href: "/cart",
			icon: IconCart,
			isActive: pathname.startsWith("/cart"),
			badge: cartCount,
		},
		{
			key: "profile",
			label: "پروفایل من",
			href: profile ? "/profile" : "/auth",
			icon: IconCircleUser,
			isActive: pathname.startsWith("/profile") || pathname.startsWith("/auth"),
			badge: 0,
		},
		{
			key: "order",
			label: "سفارش ترجمه",
			href: "/new-order",
			icon: IconTranslate,
			isActive: pathname.startsWith("/new-order"),
			badge: 0,
		},
	];

	return (
		<nav className="lg:!hidden fixed bottom-0 inset-x-0 z-[100] bg-white border-t border-neutral-200 shadow-[0_-6px_24px_rgba(26,48,71,0.08)] pb-[env(safe-area-inset-bottom)]">
			<ul className="grid grid-cols-4">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<li key={item.key}>
							<Link
								href={item.href}
								className="group flex flex-col items-center justify-center gap-1 pt-2 pb-2.5 px-1"
							>
								<span
									className={`relative flex items-center justify-center w-12 h-8 rounded-full duration-200 ${
										item.isActive ? "bg-primary/10" : "bg-transparent group-hover:bg-neutral-100"
									}`}
								>
									<Icon
										strokeWidth={1.5}
										className={`w-[22px] h-[22px] duration-200 ${
											item.isActive
												? "stroke-primary"
												: "stroke-neutral-400 group-hover:stroke-neutral-600"
										}`}
									/>
									{item.badge > 0 && (
										<span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
											{convertToPersianNumber(String(item.badge))}
										</span>
									)}
								</span>
								<span
									className={`text-[11px] leading-none duration-200 ${
										item.isActive
											? "text-primary font-semibold"
											: "text-neutral-400 group-hover:text-neutral-600"
									}`}
								>
									{item.label}
								</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
