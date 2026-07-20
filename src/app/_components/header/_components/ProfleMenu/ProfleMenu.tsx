
import {  IconDashboard, IconLogout, IconTranslate, IconUser } from "@/app/_components/icon/icons";
import { useProfiletore } from "@/stores/profile";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import CircularProgress from "../circularProgress/circularProgress";
import { withMappedError } from "@/utils/withMappedError";
import { TabanEndpoints } from "@/app/_api/endpoints";

export default function ProfleMenu({ setLogoutOpen }: { setLogoutOpen: Dispatch<SetStateAction<boolean>> }) {
	const { profile } = useProfiletore();

	const completionQuery = useQuery({
		queryKey: ["profile", "completion"],
		queryFn: () => withMappedError(() => TabanEndpoints.getProfileCompletionStatus()),
		enabled: !!profile,
		staleTime: 3_000,
	});

	const completion = completionQuery.data?.data;

	return (
		<div className="flex flex-col gap-2">
			<div className="px-2 peydda font-medium py-3 border-b border-b-neutral-200/80 text-lg text-secondary">
				{!!profile?.fullName?.trim() ? profile?.fullName?.trim() : "کاربر رسمی‌یاب"}
			</div>
			<Link href="/profile" className=" flex items-center gap-2 hover:bg-primary/10 duration-200 rounded-lg">
				<span className="px-2">
					<IconDashboard />
				</span>
				<span className="py-2.5 w-full">پیشخوان</span>
			</Link>
			{!!completion && !completion.isCompleted && (
				<Link href="/profile/complete" className=" flex items-center gap-2 bg-secondary/15 hover:bg-secondary/30 duration-200 rounded-lg">
					<span className="px-2">
						<IconUser />
					</span>
					<span className="py-2.5 border-b border-b-neutral-200/80 w-full flex items-center justify-between pl-2">
						تکمیل پروفایل
						<CircularProgress percent={+completion.completionPercent?.toFixed(0)} />
					</span>
				</Link>
			)}
			<Link href="/profile/info" className=" flex items-center gap-2 hover:bg-primary/10 duration-200 rounded-lg">
				<span className="px-2">
					<IconUser />
				</span>
				<span className="py-2.5 border-b border-b-neutral-200/80 w-full">پروفایل من</span>
			</Link>
			<Link href="/profile/orders" className=" flex items-center gap-2 hover:bg-primary/10 duration-200 rounded-lg">
				<span className="px-2">
					<IconTranslate strokeWidth={0} fill="#404040" stroke="#404040" />
				</span>
				<span className="py-2.5 border-b border-b-neutral-200/80 w-full">سفارش های ترجمه</span>
			</Link>
			{profile?.customerType==="ENTERPRISE" && <Link href="/enterprise-customers/profile" className=" flex items-center gap-2 hover:bg-primary/10 duration-200 rounded-lg">
				<span className="px-2">
					<IconDashboard strokeWidth={1.5} stroke="#404040" />
				</span>
				<span className="py-2.5 border-b border-b-neutral-200/80 w-full">پنل سازمانی</span>
			</Link>}
			<div onClick={() => setLogoutOpen(true)} className=" flex items-center gap-2 hover:bg-error/10 duration-200 rounded-lg cursor-pointer">
				<span className="px-2">
					<IconLogout stroke="#f87272 " />
				</span>
				<span className="py-2.5 w-full text-error">خروج از حساب کاربری</span>
			</div>
		</div>
	);
}
