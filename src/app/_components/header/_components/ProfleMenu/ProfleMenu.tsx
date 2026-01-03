import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconCart, IconDashboard, IconLogout, IconTranslate, IconUser } from "@/app/_components/icon/icons";
import { API_URL } from "@/config/global";
import { readData } from "@/core/http-service/http-service";
import { useCartStore } from "@/stores/cart";
import { useProfiletore } from "@/stores/profile";
import { Profile } from "@/types/profile.type";
import { Res } from "@/types/responseType";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CircularProgress from "../circularProgress/circularProgress";
import { useApi } from "@/hooks/useApi";
import { TabanEndpoints } from "@/app/_api/endpoints";

export default function ProfleMenu({ setLogoutOpen }: { setLogoutOpen: Dispatch<SetStateAction<boolean>> }) {
	const { profile, setProfile } = useProfiletore();
	const {
		result: profileCompletionResult,
		resultData: profileCompletionResultData,
		fetchData: executeProfileCompletion,
		loading: profileCompletionLoading,
	} = useApi(async () => await TabanEndpoints.getProfileCompletionStatus());

	useEffect(() => {
		executeProfileCompletion();
	}, []);

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
			{profileCompletionResult?.success && !profileCompletionResultData?.data?.isCompleted && (
				<Link href="/profile" className=" flex items-center gap-2 bg-secondary/15 hover:bg-secondary/30 duration-200 rounded-lg">
					<span className="px-2">
						<IconUser />
					</span>
					<span className="py-2.5 border-b border-b-neutral-200/80 w-full flex items-center justify-between pl-2">
						تکمیل پروفایل
						<CircularProgress percent={profileCompletionResultData?.data?.completionPercent?.toFixed(0)} />
					</span>
				</Link>
			)}
			<Link href="/profile" className=" flex items-center gap-2 hover:bg-primary/10 duration-200 rounded-lg">
				<span className="px-2">
					<IconTranslate strokeWidth={0} fill="#404040" stroke="#404040" />
				</span>
				<span className="py-2.5 border-b border-b-neutral-200/80 w-full">سفارش های ترجمه</span>
			</Link>
			<div onClick={() => setLogoutOpen(true)} className=" flex items-center gap-2 hover:bg-error/10 duration-200 rounded-lg cursor-pointer">
				<span className="px-2">
					<IconLogout stroke="#f87272 " />
				</span>
				<span className="py-2.5 w-full text-error">خروج از حساب کاربری</span>
			</div>
		</div>
	);
}
