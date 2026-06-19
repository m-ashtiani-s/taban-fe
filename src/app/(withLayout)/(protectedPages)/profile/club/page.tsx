"use client";

import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { formatJalaliDate } from "@/utils/dateFormater";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconStar, IconCheck, IconDocument, IconOrder, IconLike } from "@/app/_components/icon/icons";
import { ClubEndpoints } from "@/app/_api/clubEndpoints";
import { ClubStatus } from "@/types/club.type";
import { tierDiscount, tierMeta, tierOrder, tierThreshold } from "./_constants/tier";

const fa = (n: number | string) => convertToPersianNumber(String(n));

export default function ClubPage() {
	const showNotification = useNotificationStore((s) => s.showNotification);

	const status = useApi(async () => await ClubEndpoints.getMyStatus(), true);
	const history = useApi(async () => await ClubEndpoints.getMyHistory(1, 20));

	useEffect(() => {
		status.fetchData();
		history.fetchData();
	}, []);

	useEffect(() => {
		if (status.result && !status.result.success && !isRetryAble(status.result.code)) {
			showNotification({ type: "error", message: status.result.description ?? "دریافت وضعیت باشگاه با خطا مواجه شد" });
		}
	}, [status.result]);

	const data = status.resultData?.data as ClubStatus | undefined;
	const transactions = history.resultData?.data?.elements ?? [];

	if (status.loading && !status.result) {
		return (
			<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
				<TabanLoading size={26} />
				در حال دریافت باشگاه مشتریان...
			</div>
		);
	}

	if (!!status.result && !status.result.success && isRetryAble(status.result.code)) {
		return (
			<div className="flex justify-center mt-4">
				<ErrorComponent executeFunction={() => status.fetchData()} callAble errorText="دریافت باشگاه مشتریان با خطا مواجه شد" />
			</div>
		);
	}

	if (!data) return null;

	const meta = tierMeta[data.tier];
	const progress =
		data.nextTierMinScore !== null && data.nextTierMinScore > data.currentMinScore
			? Math.min(100, Math.round(((data.score - data.currentMinScore) / (data.nextTierMinScore - data.currentMinScore)) * 100))
			: 100;

	return (
		<div className="flex flex-col gap-6">
			{/* hero */}
			<div className={`relative overflow-hidden rounded-3xl bg-gradient-to-bl ${meta.gradient} text-white p-6 sm:p-8 shadow-lg`}>
				<div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/10" />
				<div className="absolute -bottom-16 -right-6 w-52 h-52 rounded-full bg-white/10" />
				<div className="relative flex flex-col gap-5">
					<div className="flex items-center justify-between gap-3 flex-wrap">
						<div className="flex items-center gap-2">
							<IconStar className="fill-white stroke-0 w-6 h-6" />
							<span className="peyda font-bold text-lg">باشگاه مشتریان رسمی‌یاب</span>
						</div>
						<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-bold">
							سطح {meta.label}
						</div>
					</div>

					<div className="flex items-end gap-2">
						<span className="peyda font-extrabold text-5xl leading-none">{fa(data.score)}</span>
						<span className="text-white/80 mb-1">امتیاز</span>
					</div>

					{data.discountPercent > 0 && (
						<div className="inline-flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-2.5 w-fit">
							<IconLike className="fill-white stroke-0 w-5 h-5" />
							<span className="text-sm">
								تخفیف فعلی شما: <span className="font-bold">{fa(data.discountPercent)}٪</span> روی مبلغ ترجمه‌ی هر سفارش
							</span>
						</div>
					)}

					{/* progress to next tier */}
					{data.nextTier ? (
						<div className="flex flex-col gap-2">
							<div className="flex items-center justify-between text-xs text-white/85">
								<span>
									{fa(data.pointsToNextTier ?? 0)} امتیاز تا سطح {tierMeta[data.nextTier].label}
								</span>
								<span>{fa(progress)}٪</span>
							</div>
							<div className="h-2.5 w-full rounded-full bg-white/25 overflow-hidden">
								<div className="h-full rounded-full bg-white duration-500" style={{ width: `${progress}%` }} />
							</div>
						</div>
					) : (
						<div className="text-sm text-white/90">شما به بالاترین سطح باشگاه رسیده‌اید. عالیه! 🎉</div>
					)}
				</div>
			</div>

			{/* tier ladder */}
			<div className="bg-white border border-neutral-200 rounded-2xl p-5">
				<div className="peyda font-bold text-primary mb-4">سطوح باشگاه</div>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
					{tierOrder.map((t) => {
						const tm = tierMeta[t];
						const active = t === data.tier;
						const threshold = tierThreshold(t, data.config);
						const discount = tierDiscount(t, data.config);
						return (
							<div
								key={t}
								className={`rounded-2xl border p-4 flex flex-col gap-2 duration-200 ${
									active ? `${tm.soft} ring-2 ring-offset-1 ring-current ${tm.text}` : "border-neutral-200"
								}`}
							>
								<div className="flex items-center gap-2">
									<span className={`w-3 h-3 rounded-full ${tm.dot}`} />
									<span className={`peyda font-bold ${active ? tm.text : "text-neutral-700"}`}>{tm.label}</span>
									{active && <span className="text-[10px] bg-white/70 border border-current rounded-full px-2 mr-auto">سطح شما</span>}
								</div>
								<div className="text-xs text-neutral-500">
									{t === "normal" ? "از ابتدا" : `از ${fa(threshold)} امتیاز`}
								</div>
								<div className="text-sm font-semibold text-neutral-700">
									{discount > 0 ? `${fa(discount)}٪ تخفیف ترجمه` : "بدون تخفیف"}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* how to earn */}
			<div className="bg-white border border-neutral-200 rounded-2xl p-5">
				<div className="peyda font-bold text-primary mb-4">چطور امتیاز بیشتری بگیرم؟</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<HowCard icon={<IconOrder className="stroke-primary w-5 h-5" />} title="ثبت و پرداخت سفارش" desc="با هر سفارشی که پرداخت می‌کنید، امتیاز می‌گیرید و به سطح بالاتر نزدیک می‌شوید." />
					<HowCard icon={<IconDocument className="fill-primary stroke-0 w-5 h-5" />} title="هر سند، امتیاز دارد" desc="به ازای هر نسخه از هر سندی که ترجمه می‌کنید، امتیاز به حساب شما اضافه می‌شود." />
					<HowCard icon={<IconStar className="fill-primary stroke-0 w-5 h-5" />} title="مدارک ویژه" desc="بعضی از مدارک، امتیاز بیشتری دارند! با ترجمه‌ی آن‌ها سریع‌تر سطحتان را ارتقا دهید." />
				</div>
			</div>

			{/* history */}
			<div className="bg-white border border-neutral-200 rounded-2xl p-5">
				<div className="peyda font-bold text-primary mb-4">تاریخچه‌ی امتیازها</div>
				{history.loading && !history.result ? (
					<div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-500">
						<TabanLoading size={20} />
						در حال بارگذاری...
					</div>
				) : transactions.length === 0 ? (
					<div className="text-sm text-neutral-400 py-6 text-center">هنوز امتیازی ثبت نشده است. اولین سفارشتان را ثبت کنید!</div>
				) : (
					<div className="flex flex-col gap-2.5">
						{transactions.map((tx) => (
							<div key={tx.id} className="flex items-center justify-between gap-3 border border-neutral-100 rounded-xl px-4 py-3">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
										<IconCheck className="stroke-primary w-4 h-4" />
									</div>
									<div>
										<div className="text-sm font-medium text-neutral-700">{tx.description}</div>
										<div className="text-xs text-neutral-400">{formatJalaliDate(tx.createdAt, "yyyy/mm/dd hh:mm")}</div>
									</div>
								</div>
								<div className="text-emerald-600 font-bold peyda shrink-0">+{fa(tx.points)}</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function HowCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
	return (
		<div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 flex flex-col gap-2">
			<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
			<div className="peyda font-bold text-sm text-primary">{title}</div>
			<div className="text-xs text-neutral-500 leading-6">{desc}</div>
		</div>
	);
}
