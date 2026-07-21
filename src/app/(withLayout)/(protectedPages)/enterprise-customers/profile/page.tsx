"use client";

import Link from "next/link";
import { useEnterpriseStore } from "@/stores/enterprise";
import { useProfile } from "@/hooks/useProfile";
import { IconCart, IconOrder, IconUser } from "@/app/_components/icon/icons";

function fieldOrDash(value?: string | null) {
	return value && value.trim() ? value : "—";
}

const quickLinks = [
	{ label: "کاربران زیرمجموعه", desc: "مدیریت مشتریان خود", href: "/enterprise-customers/profile/customers", icon: <IconUser /> },
	{ label: "سفارش‌ها", desc: "پیگیری سفارش‌های سازمان", href: "/enterprise-customers/profile/orders", icon: <IconOrder /> },
	{ label: "ثبت سفارش برای مشتری", desc: "سفارش ترجمه جدید", href: "/enterprise-customers/profile/orders/create", icon: <IconCart /> },
];

export default function EnterpriseDashboardPage() {
	const { enterpriseCustomer } = useEnterpriseStore();
	const { profile } = useProfile();

	return (
		<div className="flex flex-col gap-5">
			{/* header */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-primary to-[#040e27] text-white p-6 lg:p-7">
				<div className="absolute -top-12 -left-10 w-52 h-52 rounded-full bg-secondary/20 blur-3xl" />
				<div className="relative flex items-center gap-4">
					<div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0 peyda font-bold text-2xl">
						{(enterpriseCustomer?.institutionName ?? "?").trim().charAt(0) || "?"}
					</div>
					<div className="min-w-0">
						<div className="text-[11px] text-secondary font-semibold">پنل مشتری سازمانی</div>
						<div className="text-xl font-bold peyda truncate">
							{fieldOrDash(enterpriseCustomer?.institutionName)}
						</div>
						<div className="text-sm text-white/70 mt-0.5">
							مدیر حساب: {fieldOrDash(profile?.fullName)}
						</div>
					</div>
				</div>
			</div>

			{/* institution details */}
			<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
				<div className="px-5 lg:px-6 py-4 border-b border-neutral-100 text-sm font-semibold peyda">اطلاعات موسسه</div>
				<div className="divide-y divide-neutral-100">
					{[
						{ label: "نام موسسه", value: fieldOrDash(enterpriseCustomer?.institutionName) },
						{ label: "آدرس موسسه", value: fieldOrDash(enterpriseCustomer?.institutionAddress) },
						{ label: "شناسه ثبت", value: fieldOrDash(enterpriseCustomer?.registrationId) },
						{ label: "شماره تماس مدیر", value: fieldOrDash(profile?.phoneNumber || profile?.username) },
					].map((row, i) => (
						<div key={i} className="flex flex-col md:flex-row md:items-center px-5 lg:px-6 py-3.5 text-sm gap-1 md:gap-4">
							<span className="text-neutral-500 w-full md:w-44 shrink-0">{row.label}</span>
							<span className="font-medium text-neutral-800">{row.value}</span>
						</div>
					))}
				</div>
			</div>

			{/* quick links */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{quickLinks.map((q) => (
					<Link
						key={q.href}
						href={q.href}
						className="group bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 duration-200 flex flex-col gap-3"
					>
						<div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary group-hover:[&_svg]:stroke-white flex items-center justify-center duration-200">
							{q.icon}
						</div>
						<div>
							<div className="peyda font-semibold text-neutral-800">{q.label}</div>
							<div className="text-xs text-neutral-500 mt-0.5">{q.desc}</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
