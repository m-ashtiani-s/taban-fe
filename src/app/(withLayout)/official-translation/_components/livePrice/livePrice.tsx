"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { Language } from "@/types/language.type";
import { toCurrency } from "@/utils/string";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconMoney, IconTranslate } from "@/app/_components/icon/icons";
import { LivePriceProps } from "./livePrice.type";

// قیمت عمداً کلاینتی و زنده از API است (نه عدد تایپ‌شده در محتوا)؛ بقیه‌ی صفحه سروری می‌ماند
export default function LivePrice({ translationItemId: fixedItemId, items = [], documentName, sourcePage }: LivePriceProps) {
	// صفحه‌ی تک‌مدرکی مدرکش ثابت است؛ صفحه‌ی دسته‌ای (مثل مدارک تحصیلی) اول مدرک را از کاربر می‌گیرد
	const hasItemPicker = !fixedItemId && items.length > 1;
	const [pickedItemId, setPickedItemId] = useState<string | null>(!fixedItemId && items.length === 1 ? items[0].translationItemId : null);
	const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

	const translationItemId = fixedItemId ?? pickedItemId;
	const pickedItem = items.find((item) => item.translationItemId === translationItemId);
	const priceSubject = pickedItem?.title ?? documentName;
	const canPrice = !!fixedItemId || items.length > 0;

	const filters = { translationItemId: translationItemId ?? undefined, languageId: selectedLanguage?.languageId };
	const hasSelection = !!translationItemId && !!selectedLanguage;

	const languagesQuery = useQuery({
		queryKey: ["translation", "languages"],
		queryFn: () => withMappedError(() => TranslationEndpoints.getLanguages()),
		enabled: canPrice,
	});
	const baseRateQuery = useQuery({
		queryKey: ["translation", "baseRate", filters],
		queryFn: () => withMappedError(() => TranslationEndpoints.getBaseRate(filters)),
		enabled: hasSelection,
	});
	const certificationQuery = useQuery({
		queryKey: ["translation", "certificationRate", filters],
		queryFn: () => withMappedError(() => TranslationEndpoints.getCertificationRates(filters)),
		enabled: hasSelection,
	});

	const languages = languagesQuery.data?.data ?? [];
	const baseRate = baseRateQuery.data?.data?.[0] ?? null;
	const certification = certificationQuery.data?.data?.[0] ?? null;
	const justicePrice = Number(certification?.justicePrice) || 0;
	const mfaPrice = Number(certification?.mfaPrice) || 0;
	const orderQuery = new URLSearchParams(translationItemId ? { item: translationItemId } : {});
	if (translationItemId && selectedLanguage) orderQuery.set("lang", selectedLanguage.languageId);
	const orderHref = orderQuery.toString() ? `/new-order?${orderQuery.toString()}` : "/new-order";

	return (
		<div className="not-prose my-6 rounded-2xl border border-secondary/30 bg-suppliment/60 p-5 lg:p-6 flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
					<IconMoney width={22} height={22} className="stroke-white" />
				</span>
				<div className="flex flex-col">
					<span className="peyda font-bold text-primary">محاسبه‌ی آنلاین هزینه</span>
					<span className="text-xs text-neutral-500">نرخ‌ها مستقیم از سامانه‌ی سفارش خوانده می‌شوند</span>
				</div>
			</div>
			{!canPrice ? (
				<p className="text-sm text-neutral-600 leading-7">قیمت دقیق ترجمه‌ی {documentName} پس از انتخاب زبان و تاییدات، در فرم ثبت سفارش نمایش داده می‌شود.</p>
			) : (
				<>
					{hasItemPicker && (
						<div className="flex flex-col gap-3">
							<div className="text-sm font-semibold text-neutral-700 peyda">۱. مدرک را انتخاب کنید</div>
							<div className="flex flex-wrap gap-2.5">
								{items.map((item) => {
									const active = pickedItemId === item.translationItemId;
									return (
										<button
											key={item.translationItemId}
											type="button"
											aria-pressed={active}
											onClick={() => setPickedItemId(active ? null : item.translationItemId)}
											className={`text-sm peyda rounded-xl border px-3.5 py-2 duration-200 ${
												active ? "bg-primary border-primary text-white" : "bg-white border-neutral-200 text-neutral-600 hover:border-primary/40"
											}`}
										>
											{item.title}
										</button>
									);
								})}
							</div>
						</div>
					)}
					<div className="text-sm font-semibold text-neutral-700 peyda">
						{hasItemPicker ? "۲. زبان ترجمه را انتخاب کنید" : "زبان ترجمه را انتخاب کنید تا هزینه را ببینید"}
					</div>
					{languagesQuery.error ? (
						<ErrorComponent executeFunction={() => languagesQuery.refetch()} errorText={languagesQuery.error.description} />
					) : languagesQuery.isPending ? (
						<div className="flex items-center gap-2 text-xs text-neutral-400">
							<TabanLoading size={16} /> در حال دریافت زبان‌ها...
						</div>
					) : (
						<div className="flex flex-wrap gap-2.5">
							{languages.map((language) => {
								const active = selectedLanguage?.languageId === language.languageId;
								return (
									<button
										key={language.languageId}
										type="button"
										aria-pressed={active}
										onClick={() => setSelectedLanguage(active ? null : language)}
										className={`flex items-center gap-2 text-sm peyda rounded-xl border px-3.5 py-2 duration-200 ${
											active ? "bg-primary border-primary text-white" : "bg-white border-neutral-200 text-neutral-600 hover:border-primary/40"
										}`}
									>
										<span className="w-6 h-6 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
											<Image width={24} height={24} alt="" src={`/images/languages/${language.languageCode?.toLowerCase()}.png`} />
										</span>
										{language.languageName}
									</button>
								);
							})}
						</div>
					)}

					{hasItemPicker && !translationItemId && selectedLanguage && (
						<p className="text-sm text-neutral-600 leading-7">برای دیدن هزینه، مدرک را هم انتخاب کنید.</p>
					)}
					{hasSelection &&
						(baseRateQuery.error || certificationQuery.error ? (
							<ErrorComponent
								executeFunction={() => {
									baseRateQuery.refetch();
									certificationQuery.refetch();
								}}
								errorText={(baseRateQuery.error ?? certificationQuery.error)?.description}
							/>
						) : baseRateQuery.isPending || certificationQuery.isPending ? (
							<div className="flex items-center gap-2 text-xs text-neutral-400">
								<TabanLoading size={16} /> در حال محاسبه‌ی هزینه...
							</div>
						) : !baseRate ? (
							<p className="text-sm text-neutral-600 leading-7">
								برای ترجمه‌ی {priceSubject} به زبان {selectedLanguage?.languageName} هنوز نرخی ثبت نشده است؛ زبان دیگری را انتخاب کنید یا با پشتیبانی تماس بگیرید.
							</p>
						) : (
							<dl className="bg-white rounded-xl border border-neutral-100 divide-y divide-neutral-100 text-sm">
								<div className="flex items-center justify-between px-4 py-3">
									<dt className="text-neutral-600">{baseRate.title || "نرخ پایه‌ی ترجمه"}</dt>
									<dd className="font-semibold text-primary">{toCurrency(baseRate.basePrice)} تومان</dd>
								</div>
								{justicePrice > 0 && (
									<div className="flex items-center justify-between px-4 py-3">
										<dt className="text-neutral-600">مهر دادگستری</dt>
										<dd className="font-semibold text-primary">{toCurrency(justicePrice)} تومان</dd>
									</div>
								)}
								{mfaPrice > 0 && (
									<div className="flex items-center justify-between px-4 py-3">
										<dt className="text-neutral-600">مهر وزارت امور خارجه</dt>
										<dd className="font-semibold text-primary">{toCurrency(mfaPrice)} تومان</dd>
									</div>
								)}
							</dl>
						))}
					<p className="text-xs text-neutral-500 leading-6">
						هزینه‌ی نهایی با توجه به تعداد صفحات، تاییدات، استعلام‌ها و نسخه‌های اضافه پیش از پرداخت در فرم سفارش محاسبه می‌شود.
					</p>
				</>
			)}
			<div className="flex">
				<TabanButton
					isLink
					href={orderHref}
					data-track-event="start_order"
					data-track-source={sourcePage}
					data-track-item={translationItemId ?? undefined}
					icon={<IconTranslate strokeWidth={0} className="fill-white w-5 h-5" />}
					className="!bg-secondary !border-none !text-white !no-underline font-semibold"
				>
					همین مدرک را سفارش بده
				</TabanButton>
			</div>
		</div>
	);
}
