"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { useProfiletore } from "@/stores/profile";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconCart, IconDocument, IconStar, IconTranslate, IconUser } from "@/app/_components/icon/icons";
import ReferralCode from "./_components/referralCode/referralCode";

export default function Page() {
	const { profile } = useProfiletore();

	const completionQuery = useQuery({
		queryKey: ["profile", "completion"],
		queryFn: () => withMappedError(() => TabanEndpoints.getProfileCompletionStatus()),
		staleTime: 3_000,
		meta: { showNotification: true },
	});

	const completion = completionQuery.data?.data;
	const percent = Math.round(completion?.completionPercent ?? 0);
	const isCompleted = completion?.isCompleted ?? false;
	const greetingName = profile?.fullName?.trim() || "کاربر رسمی‌یاب";

	return (
		<div className="flex flex-col gap-6">
			{/* Hero greeting */}
			<div className="relative bg-gradient-to-bl from-primary via-primary to-primary/85 rounded-2xl text-white p-6 lg:p-8 overflow-hidden">
				<div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-secondary/15 blur-2xl"></div>
				<div className="absolute -bottom-16 -right-8 w-56 h-56 rounded-full bg-white/5 blur-2xl"></div>
				<div className="relative z-10 flex flex-col gap-2">
					<div className="text-sm text-white/70">به پیشخوان خود خوش آمدید</div>
					<h1 className="peyda font-bold text-2xl lg:text-3xl">سلام {greetingName} 👋</h1>
					<p className="text-sm text-white/80 max-w-xl">
						از این بخش می‌توانید پروفایل، سفارش‌ها و فعالیت‌های خود را در رسمی‌یاب مدیریت کنید.
					</p>
				</div>
			</div>

			{/* Profile completion banner */}
			{completionQuery.isPending ? (
				<div className="bg-white border border-neutral-200 rounded-2xl p-6 flex items-center justify-center gap-2 text-sm">
					<TabanLoading size={24} />
					در حال دریافت اطلاعات پروفایل...
				</div>
			) : !isCompleted ? (
				<div className="bg-white border border-secondary/40 rounded-2xl p-5 lg:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-5 shadow-sm">
					<div className="relative w-24 h-24 shrink-0 mx-auto md:mx-0">
						<svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
							<circle cx="18" cy="18" r="15" fill="none" stroke="rgba(184, 162, 124, 0.2)" strokeWidth="3" />
							<circle
								cx="18"
								cy="18"
								r="15"
								fill="none"
								stroke="#b8a27c"
								strokeWidth="3"
								strokeDasharray={`${(percent / 100) * 94.25} 94.25`}
								strokeLinecap="round"
							/>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<div className="text-2xl font-bold text-secondary peyda">{percent}٪</div>
							<div className="text-[10px] text-neutral-500">تکمیل</div>
						</div>
					</div>

					<div className="flex-1">
						<div className="flex items-center gap-2 text-secondary font-semibold mb-1">
							<IconStar width={20} height={20} className="fill-secondary stroke-0" />
							پروفایلت ناقصه
						</div>
						<p className="text-sm text-neutral-600 leading-7">
							برای ثبت سفارش ترجمه، تکمیل پروفایل الزامیه. با تکمیل اطلاعات، تجربه راحت‌تری از خدمات رسمی‌یاب خواهی
							داشت.
						</p>
						{completion?.incompleteItems && completion.incompleteItems.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mt-3">
								{completion.incompleteItems.slice(0, 6).map((item) => (
									<span
										key={item.itemKey}
										className="text-[11px] text-secondary bg-secondary/10 border border-secondary/20 px-2 py-1 rounded-md"
									>
										{item.itemName}
									</span>
								))}
								{completion.incompleteItems.length > 6 && (
									<span className="text-[11px] text-neutral-500 px-2 py-1">
										و {completion.incompleteItems.length - 6} مورد دیگر
									</span>
								)}
							</div>
						)}
					</div>

					<div className="shrink-0 self-stretch md:self-center">
						<TabanButton isLink href="/profile/complete" className="!w-full md:!w-auto">
							تکمیل پروفایل
						</TabanButton>
					</div>
				</div>
			) : (
				<div className="bg-white border border-success/40 rounded-2xl p-5 lg:p-6 flex items-center gap-4 shadow-sm">
					<div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center text-success text-2xl">✓</div>
					<div className="flex max-lg:flex-col gap-4 lg:justify-between lg:flex-1">
						<div className="flex-1">
							<div className="font-semibold text-success peyda">پروفایل شما تکمیل است</div>
							<div className="text-sm text-neutral-600 mt-0.5">می‌توانید با خیال راحت سفارش ترجمه ثبت کنید.</div>
						</div>
						<TabanButton variant="bordered" isLink href="/profile/info">
							مشاهده پروفایل
						</TabanButton>
					</div>
				</div>
			)}

			{/* Quick actions grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<Link
					href="/new-order"
					className="group bg-white border border-neutral-200 hover:border-primary rounded-2xl p-5 flex items-start gap-4 duration-200"
				>
					<div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center shrink-0">
						<IconTranslate stroke="#1a3047" strokeWidth={0} className="fill-primary" />
					</div>
					<div className="flex-1">
						<div className="font-semibold peyda group-hover:text-primary duration-200">ثبت سفارش ترجمه</div>
						<p className="text-xs text-neutral-500 mt-1 leading-6">
							پرونده‌هایت رو بفرست تا با بهترین کیفیت ترجمه رسمی بشن.
						</p>
					</div>
				</Link>

				<Link
					href="/profile/info"
					className="group bg-white border border-neutral-200 hover:border-primary rounded-2xl p-5 flex items-start gap-4 duration-200"
				>
					<div className="w-12 h-12 rounded-xl bg-secondary/15 group-hover:bg-secondary/25 flex items-center justify-center shrink-0">
						<IconUser stroke="#b8a27c" />
					</div>
					<div className="flex-1">
						<div className="font-semibold peyda group-hover:text-primary duration-200">اطلاعات پروفایل</div>
						<p className="text-xs text-neutral-500 mt-1 leading-6">اطلاعات حساب کاربری خودت رو مشاهده و ویرایش کن.</p>
					</div>
				</Link>

				<Link
					href="/cart"
					className="group bg-white border border-neutral-200 hover:border-primary rounded-2xl p-5 flex items-start gap-4 duration-200"
				>
					<div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center shrink-0">
						<IconCart stroke="#1a3047" />
					</div>
					<div className="flex-1">
						<div className="font-semibold peyda group-hover:text-primary duration-200">سبد خرید</div>
						<p className="text-xs text-neutral-500 mt-1 leading-6">سفارش‌های ترجمه ثبت‌شده خود را مدیریت کنید.</p>
					</div>
				</Link>
			</div>

			{/* Referral teaser */}
			{profile?.ownReferralCode && (
				<div className="bg-gradient-to-l from-secondary/10 via-white to-white border border-secondary/30 rounded-2xl p-5 lg:p-6 flex flex-col md:flex-row items-center gap-5">
					<div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-2xl shrink-0">
						🎁
					</div>
					<div className="flex-1">
						<div className="font-semibold peyda text-primary">کد معرف اختصاصی شما</div>
						<p className="text-xs text-neutral-600 mt-1 leading-6">
							کد زیر رو با دوستانت به اشتراک بذار. هر بار که کسی با کد تو ثبت‌نام و سفارش ثبت کنه، ۱۰٪ از مبلغ سفارش
							به‌عنوان تخفیف به تو تعلق می‌گیره.
						</p>
					</div>
					<ReferralCode code={profile.ownReferralCode} />
				</div>
			)}
		</div>
	);
}
