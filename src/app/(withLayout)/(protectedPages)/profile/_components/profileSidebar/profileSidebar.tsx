"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import { withMappedError } from "@/utils/withMappedError";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { useProfiletore } from "@/stores/profile";
import { IconCart, IconCircleUser, IconDashboard, IconDocument, IconLogout, IconMoney, IconOrder, IconStar, IconTruck, IconUser } from "@/app/_components/icon/icons";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { Profile } from "@/types/profile.type";

const menu = [
	{
		label: "پیشخوان",
		href: "/profile",
		icon: <IconDashboard />,
		matchExact: true,
	},
	{
		label: "پروفایل",
		href: "/profile/info",
		icon: <IconUser />,
		matchExact: false,
	},
	{
		label: "آدرس‌های من",
		href: "/profile/addresses",
		icon: <IconTruck />,
		matchExact: false,
	},
	{
		label: "پاسپورت‌های من",
		href: "/profile/passports",
		icon: <IconDocument />,
		matchExact: false,
	},
	{
		label: "سفارش‌های من",
		href: "/profile/orders",
		icon: <IconOrder />,
		matchExact: false,
	},
	{
		label: "صورتحساب‌های من",
		href: "/profile/invoices",
		icon: <IconMoney />,
		matchExact: false,
	},
	{
		label: "باشگاه مشتریان",
		href: "/profile/club",
		icon: <IconStar />,
		matchExact: false,
	},
];

export default function ProfileSidebar() {
	const pathname = usePathname();
	const [logoutOpen, setLogoutOpen] = useState(false);
	const { profile, setProfile } = useProfiletore();

	const {
		result: profileResult,
		resultData: profileResultData,
		fetchData: executeProfile,
	} = useApi(async () => await TabanEndpoints.getProfile());

	const completionQuery = useQuery({
		queryKey: ["profile", "completion"],
		queryFn: () => withMappedError(() => TabanEndpoints.getProfileCompletionStatus()),
		staleTime: 3_000,
		meta: { showNotification: true },
	});

	useEffect(() => {
		executeProfile();
	}, []);

	useEffect(() => {
		if (profileResult?.success) {
			setProfile((profileResultData?.data as Profile) ?? null);
		}
	}, [profileResult]);

	const completion = completionQuery.data?.data;
	const displayProfile = profile ?? profileResultData?.data;

	const logoutHandler = async () => {
		await localStorage.removeItem("token");
		setProfile(null);
		setLogoutOpen(false);
		// رفرش کامل صفحه (بازگشت به خانه) تا کل state اپ به حالت خروج برگردد
		window.location.href = "/";
	};

	return (
		<>
			{/* ── Desktop sidebar ── */}
			<aside className="hidden lg:block lg:w-[280px] shrink-0 lg:sticky lg:top-[88px] lg:self-start">
				<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
					{/* user header */}
					<div className="relative bg-gradient-to-bl from-primary to-primary/85 px-5 py-5 text-white">
						<div className="flex items-center gap-3">
							<div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/30 overflow-hidden flex items-center justify-center shrink-0">
								{displayProfile?.profilePic ? (
									<img
										src={displayProfile.profilePic}
										alt="profile"
										className="w-full h-full object-cover"
									/>
								) : (
									<IconCircleUser width={36} height={36} stroke="#fff" strokeWidth={1.4} />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-semibold peyda truncate">
									{!!displayProfile?.fullName?.trim()
										? displayProfile.fullName.trim()
										: "کاربر رسمی‌یاب"}
								</div>
								<div className="text-xs text-white/70 truncate" dir="ltr">
									{displayProfile?.phoneNumber ?? displayProfile?.username ?? ""}
								</div>
							</div>
						</div>
					</div>

					{/* completion banner */}
					{completion && !completion.isCompleted && (
						<Link
							href="/profile/complete"
							className="mx-4 mt-4 mb-1 p-3 rounded-xl border border-secondary/40 bg-secondary/10 hover:bg-secondary/20 duration-200 flex items-center justify-between gap-2"
						>
							<div>
								<div className="text-xs font-semibold text-secondary">تکمیل پروفایل</div>
								<div className="text-[11px] text-neutral-600 mt-0.5">
									{Math.round(completion.completionPercent)}٪ تکمیل شده
								</div>
							</div>
							<div className="relative w-10 h-10">
								<svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
									<circle
										cx="18"
										cy="18"
										r="15"
										fill="none"
										stroke="rgba(184, 162, 124, 0.25)"
										strokeWidth="3"
									/>
									<circle
										cx="18"
										cy="18"
										r="15"
										fill="none"
										stroke="#b8a27c"
										strokeWidth="3"
										strokeDasharray={`${(completion.completionPercent / 100) * 94.25} 94.25`}
										strokeLinecap="round"
									/>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-secondary">
									{Math.round(completion.completionPercent)}٪
								</div>
							</div>
						</Link>
					)}

					{/* menu */}
					<nav className="p-3 flex flex-col gap-1">
						{menu.map((item) => {
							const active = item.matchExact
								? pathname === item.href
								: pathname.startsWith(item.href);
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
						{displayProfile?.customerType === "ENTERPRISE" ? (
							<Link
								href="/enterprise-customers/profile"
								className="flex items-center gap-3 px-3 py-2.5 rounded-xl duration-200 text-sm text-secondary bg-secondary/10 hover:bg-secondary/20 mt-1"
							>
								<IconDashboard />
								<span>پنل سازمانی</span>
							</Link>
						) : (
							<Link
								href="/enterprise-customers"
								className="flex items-center gap-3 px-3 py-2.5 rounded-xl duration-200 text-sm text-secondary bg-secondary/10 hover:bg-secondary/20 mt-1"
							>
								<IconDashboard />
								<span>مشتری سازمانی شوید</span>
							</Link>
						)}
						<button
							type="button"
							onClick={() => setLogoutOpen(true)}
							className="flex items-center gap-3 px-3 py-2.5 rounded-xl duration-200 text-sm text-error hover:bg-error/10 mt-1"
						>
							<IconLogout stroke="#f87272" />
							<span>خروج از حساب</span>
						</button>
					</nav>
				</div>
			</aside>

			{/* ── Mobile horizontal nav — content-first, compact, sticky, scrollable ── */}
			<div className="lg:hidden -mx-4 sticky top-[48px] z-30 bg-white/95 backdrop-blur border-b border-neutral-200">
				<div className="flex items-center gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{menu.map((item) => {
						const active = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm whitespace-nowrap shrink-0 border duration-200 [&_svg]:w-[18px] [&_svg]:h-[18px] ${
									active
										? "bg-primary text-white border-primary shadow-sm [&_svg]:stroke-white"
										: "bg-white text-neutral-700 border-neutral-200 [&_svg]:stroke-neutral-500"
								}`}
							>
								<span className="shrink-0">{item.icon}</span>
								<span>{item.label}</span>
							</Link>
						);
					})}

					{completion && !completion.isCompleted && (
						<Link
							href="/profile/complete"
							className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm whitespace-nowrap shrink-0 border border-secondary/40 bg-secondary/10 text-secondary duration-200"
						>
							<span className="font-semibold">تکمیل پروفایل</span>
							<span className="text-[11px] opacity-80">{Math.round(completion.completionPercent)}٪</span>
						</Link>
					)}

					<Link
						href={displayProfile?.customerType === "ENTERPRISE" ? "/enterprise-customers/profile" : "/enterprise-customers"}
						className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm whitespace-nowrap shrink-0 border duration-200 [&_svg]:w-[18px] [&_svg]:h-[18px] ${
							pathname.startsWith("/enterprise-customers")
								? "bg-primary text-white border-primary shadow-sm [&_svg]:stroke-white"
								: "bg-secondary/10 text-secondary border-secondary/40 [&_svg]:stroke-secondary"
						}`}
					>
						<IconDashboard />
						<span>{displayProfile?.customerType === "ENTERPRISE" ? "پنل سازمانی" : "مشتری سازمانی"}</span>
					</Link>

					<button
						type="button"
						onClick={() => setLogoutOpen(true)}
						className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm whitespace-nowrap shrink-0 border border-error/30 bg-error/10 text-error duration-200 [&_svg]:w-[18px] [&_svg]:h-[18px]"
					>
						<IconLogout stroke="#f87272" />
						<span>خروج</span>
					</button>
				</div>
			</div>

			<TabanModal
				onClose={() => {}}
				open={logoutOpen}
				setOpen={setLogoutOpen}
				title="خروج از حساب کاربری"
			>
				<div>
					آیا برای خروج از حساب کاربری اطمینان دارید؟
					<div className="mt-10 flex justify-end gap-4">
						<TabanButton onClick={() => setLogoutOpen(false)} variant="bordered">
							انصراف
						</TabanButton>
						<TabanButton onClick={logoutHandler}>خروج از حساب</TabanButton>
					</div>
				</div>
			</TabanModal>
		</>
	);
}
