"use client";

import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { useProfiletore } from "@/stores/profile";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconCircleUser, IconEdit } from "@/app/_components/icon/icons";
import { Profile } from "@/types/profile.type";
import ReferralCode from "../_components/referralCode/referralCode";

function fieldOrDash(value?: string | null) {
	return value && value.trim() ? value : <span className="text-neutral-400">—</span>;
}

const userTypeLabel = (t?: string | null) => {
	if (t === "individual") return "حقیقی";
	if (t === "legal") return "حقوقی";
	return null;
};

export default function Page() {
	const { profile, setProfile } = useProfiletore();

	const {
		result: profileResult,
		resultData: profileResultData,
		fetchData: executeProfile,
		loading: profileLoading,
	} = useApi(async () => await TabanEndpoints.getProfile());

	const { resultData: completionData, fetchData: executeCompletion } = useApi(
		async () => await TabanEndpoints.getProfileCompletionStatus(),
	);

	useEffect(() => {
		executeProfile();
		executeCompletion();
	}, []);

	useEffect(() => {
		if (profileResult?.success) {
			setProfile((profileResultData?.data as Profile) ?? null);
		}
	}, [profileResult]);

	const user = profile ?? profileResultData?.data;
	const completion = completionData?.data;
	const percent = Math.round(completion?.completionPercent ?? 0);
	const isCompleted = completion?.isCompleted ?? false;

	if (profileLoading && !user) {
		return (
			<div className="flex items-center justify-center py-16 gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال دریافت اطلاعات...
			</div>
		);
	}

	const userType = userTypeLabel(user?.userType ?? null);
	const languages = (user?.requiredLanguages ?? []).filter(Boolean);

	const rows: { label: string; value: React.ReactNode }[] = [
		{ label: "نام", value: fieldOrDash(user?.firstName) },
		{ label: "نام خانوادگی", value: fieldOrDash(user?.lastName) },
		{ label: "شماره تماس", value: fieldOrDash(user?.phoneNumber || user?.username) },
		{ label: "کد ملی", value: fieldOrDash(user?.nationalId) },
		{
			label: "نوع کاربری",
			value: userType ?? <span className="text-neutral-400">—</span>,
		},
		{
			label: "حوزه تخصصی",
			value: fieldOrDash(user?.specialtyField),
		},
		{
			label: "نحوه آشنایی با ما",
			value: fieldOrDash(user?.referralSource),
		},
		{
			label: "کد معرف استفاده شده",
			value: fieldOrDash(user?.referralCode),
		},
	];

	return (
		<div className="flex flex-col gap-5">
			{/* header card */}
			<div className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 flex flex-col md:flex-row items-center gap-5 shadow-sm">
				<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/5 flex items-center justify-center shrink-0">
					{user?.profilePic ? (
						<img
							src={user.profilePic}
							alt="profile"
							className="w-full h-full object-cover"
						/>
					) : (
						<IconCircleUser width={56} height={56} stroke="#1a3047" />
					)}
				</div>
				<div className="flex-1 text-center md:text-right">
					<div className="text-xl font-bold peyda text-primary">
						{user?.fullName?.trim() || "کاربر رسمی‌یاب"}
					</div>
					<div className="text-sm text-neutral-500 mt-1" dir="ltr">
						{user?.phoneNumber || user?.username}
					</div>
				</div>
				<TabanButton isLink href="/profile/complete" className="w-full md:w-auto">
					<span className="flex items-center gap-2">
						<IconEdit stroke="#fff" width={16} height={16} />
						<span>ویرایش پروفایل</span>
					</span>
				</TabanButton>
			</div>

			{/* completion bar */}
			<div
				className={`bg-white border rounded-2xl p-5 shadow-sm ${
					isCompleted ? "border-success/40" : "border-secondary/40"
				}`}
			>
				<div className="flex items-center justify-between mb-2">
					<div className="text-sm font-semibold text-neutral-700">
						{isCompleted ? "پروفایل شما تکمیل است" : "تکمیل پروفایل"}
					</div>
					<div
						className={`text-sm font-bold ${
							isCompleted ? "text-success" : "text-secondary"
						}`}
					>
						{percent}٪
					</div>
				</div>
				<div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
					<div
						className={`h-full rounded-full duration-500 ${
							isCompleted ? "bg-success" : "bg-secondary"
						}`}
						style={{ width: `${percent}%` }}
					/>
				</div>
				{!isCompleted && completion?.incompleteItems && completion.incompleteItems.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-1.5">
						<span className="text-xs text-neutral-500 ml-2">موارد ناقص:</span>
						{completion.incompleteItems.map((item) => (
							<span
								key={item.itemKey}
								className="text-[11px] text-secondary bg-secondary/10 border border-secondary/20 px-2 py-1 rounded-md"
							>
								{item.itemName}
							</span>
						))}
					</div>
				)}
			</div>

			{/* details */}
			<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
				<div className="px-5 lg:px-6 py-4 border-b border-neutral-100 text-sm font-semibold peyda">
					اطلاعات حساب کاربری
				</div>
				<div className="divide-y divide-neutral-100">
					{rows.map((row, i) => (
						<div
							key={i}
							className="flex flex-col md:flex-row md:items-center px-5 lg:px-6 py-3.5 text-sm gap-1 md:gap-4"
						>
							<span className="text-neutral-500 w-full md:w-44 shrink-0">{row.label}</span>
							<span className="font-medium text-neutral-800">{row.value}</span>
						</div>
					))}
					<div className="px-5 lg:px-6 py-4">
						<div className="text-neutral-500 text-sm mb-2">زبان‌های مورد نیاز شما</div>
						{languages.length > 0 ? (
							<div className="flex flex-wrap gap-1.5">
								{languages.map((lang) => (
									<span
										key={lang.languageId}
										className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
									>
										{lang.languageName}
									</span>
								))}
							</div>
						) : (
							<span className="text-neutral-400 text-sm">—</span>
						)}
					</div>
				</div>
			</div>

			{/* referral block */}
			{user?.ownReferralCode && (
				<div className="bg-gradient-to-l from-secondary/10 via-white to-white border border-secondary/30 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
					<div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xl shrink-0">
						🎁
					</div>
					<div className="flex-1">
						<div className="font-semibold peyda text-primary">کد معرف اختصاصی شما</div>
						<p className="text-xs text-neutral-600 mt-1 leading-6">
							این کد رو با دوستانت به اشتراک بذار. هر سفارش با کد تو، ۱۰٪ تخفیف برات هدیه
							داره.
						</p>
					</div>
					<ReferralCode code={user.ownReferralCode} />
				</div>
			)}
		</div>
	);
}
