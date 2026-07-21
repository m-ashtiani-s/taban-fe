"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCart, IconDashboard, IconOrder, IconUser } from "@/app/_components/icon/icons";
import { useEnterpriseStore } from "@/stores/enterprise";
import { useProfile } from "@/hooks/useProfile";

const menu = [
	{ label: "پیشخوان", href: "/enterprise-customers/profile", icon: <IconDashboard />, matchExact: true },
	{ label: "کاربران زیرمجموعه", href: "/enterprise-customers/profile/customers", icon: <IconUser />, matchExact: false },
	{ label: "سفارش‌ها", href: "/enterprise-customers/profile/orders", icon: <IconOrder />, matchExact: false },
	{ label: "ثبت سفارش برای مشتری", href: "/enterprise-customers/profile/orders/create", icon: <IconCart/>, matchExact: false },
];

export default function EnterpriseSidebar() {
	const pathname = usePathname();
	const { enterpriseCustomer } = useEnterpriseStore();
	const { profile } = useProfile();

	// نزدیک‌ترین (طولانی‌ترین) مسیرِ منطبق انتخاب می‌شود تا روی زیرمسیرها فقط یک آیتم فعال بماند
	const activeHref = menu
		.filter((item) => (item.matchExact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)))
		.reduce<string | null>((best, item) => (best && best.length >= item.href.length ? best : item.href), null);

	return (
		<aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-[88px] lg:self-start">
			<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
				<div className="relative bg-gradient-to-bl from-primary to-[#040e27] px-5 py-5 text-white">
					<div className="text-[11px] text-secondary font-semibold mb-1">پنل مشتری سازمانی</div>
					<div className="font-semibold peyda truncate">
						{enterpriseCustomer?.institutionName?.trim() || profile?.fullName?.trim() || "مشتری سازمانی"}
					</div>
					<div className="text-xs text-white/70 truncate mt-0.5" dir="ltr">
						{profile?.phoneNumber ?? profile?.username ?? ""}
					</div>
				</div>

				<nav className="p-3 flex flex-col gap-1">
					{menu.map((item) => {
						const active = item.href === activeHref;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-xl duration-200 text-sm ${
									active
										? "bg-primary text-white shadow-sm [&_svg]:stroke-white"
										: "text-neutral-700 hover:bg-primary/5"
								}`}
							>
								<span className="shrink-0">{item.icon}</span>
								<span>{item.label}</span>
							</Link>
						);
					})}
					<Link
						href="/profile"
						className="flex items-center gap-3 px-3 py-2.5 rounded-xl duration-200 text-sm text-neutral-500 hover:bg-neutral-100 mt-1"
					>
						<IconUser />
						<span>بازگشت به حساب کاربری</span>
					</Link>
				</nav>
			</div>
		</aside>
	);
}
