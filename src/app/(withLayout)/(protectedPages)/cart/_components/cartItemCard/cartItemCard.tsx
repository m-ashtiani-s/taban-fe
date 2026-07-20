"use client";

import Link from "next/link";
import { toCurrency } from "@/utils/string";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconDocument, IconEdit, IconRecycle, IconTranslate } from "@/app/_components/icon/icons";
import { CartItemCardProps } from "./cartItemCard.type";

export default function CartItemCard({ item, itemDiscount, appliedCoupon, onDelete }: CartItemCardProps) {
	const { breakdown } = item;
	const docDiscountMap = new Map<string, number>(
		(itemDiscount?.documents ?? []).map((d) => [d.documentKey, d.discountAmount])
	);

	return (
		<div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 duration-200">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
						<IconDocument className="fill-primary stroke-0 w-5 h-5" />
					</div>
					<div>
						<div className="peyda font-bold text-primary">{breakdown.translationItemTitle}</div>
						<div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
							<IconTranslate stroke="#888" strokeWidth={0} className="fill-neutral-400 w-3.5 h-3.5" />
							{breakdown.languageName}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<Link href={`/cart/${item.cartItemId}`}>
						<TabanButton variant="icon" className="!h-8 !min-w-8 !bg-primary/5 hover:!bg-primary/15">
							<IconEdit className="stroke-primary w-4 h-4" />
						</TabanButton>
					</Link>
					<TabanButton variant="icon" className="!h-8 !min-w-8 !bg-error/5 hover:!bg-error/15" onClick={onDelete}>
						<IconRecycle viewBox="0 0 589.004 589.004" strokeWidth={1} className="stroke-error fill-error w-4 h-4" />
					</TabanButton>
				</div>
			</div>

			<div className="flex flex-col gap-3 border-t border-dashed border-neutral-200 pt-3">
				{breakdown.documents.map((doc) => {
					const docDiscount = docDiscountMap.get(doc.documentKey) ?? 0;
					return (
						<div key={doc.documentKey} className="border border-neutral-200 rounded-xl p-3 flex flex-col gap-2 bg-neutral-50/30">
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-1.5 font-semibold text-secondary">
									<div className="w-1.5 h-1.5 rounded-sm bg-secondary rotate-45 shrink-0" />
									{doc.title}
									{(doc.copyCount ?? 1) > 1 && (
										<span className="text-[10px] text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded mr-1">
											× {convertToPersianNumber(String(doc.copyCount))} نسخه
										</span>
									)}
								</div>
								<div className="font-bold text-primary">
									{toCurrency(doc.documentTotal)}
									<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
								</div>
							</div>
							<div className="flex flex-col gap-1 text-xs text-neutral-500 pr-3">
								<div className="flex items-center justify-between">
									<span>هزینه ترجمه</span>
									<span>
										{toCurrency(doc.translationTotal ?? (doc.base?.total ?? 0) + (doc.specialsTotal ?? 0))} تومان
									</span>
								</div>
								{doc.mfaCertification && (
									<div className="flex items-center justify-between">
										<span>مهر وزارت امور خارجه</span>
										<span>{toCurrency(doc.mfaCertification.price)} تومان</span>
									</div>
								)}
								{doc.justiceCertification && (
									<div className="flex items-center justify-between">
										<span>مهر دادگستری</span>
										<span>{toCurrency(doc.justiceCertification.price)} تومان</span>
									</div>
								)}
								{doc.embassyApprovals?.map((e) => (
									<div key={e.embassyRateId} className="flex items-center justify-between">
										<span>{e.embassyName}</span>
										<span>{toCurrency(e.price)} تومان</span>
									</div>
								))}
								{doc.justiceInquiries?.map((i) => (
									<div key={i.justiceInquiryRateId} className="flex items-center justify-between">
										<span>{i.justiceInquiryName}</span>
										<span>{toCurrency(i.price)} تومان</span>
									</div>
								))}
							</div>
							{docDiscount > 0 && (
								<div className="flex items-center justify-between text-xs bg-success/10 border border-success/30 rounded-lg px-2 py-1.5 mt-1">
									<span className="text-success font-medium">
										تخفیف کوپن
										{appliedCoupon?.appliesTo === "base" ? " (روی نرخ پایه)" : ""}
									</span>
									<span className="font-bold text-success">
										- {toCurrency(docDiscount)}
										<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
									</span>
								</div>
							)}
						</div>
					);
				})}
			</div>

			<div className="border-t border-neutral-100 pt-3 flex flex-col gap-2">
				{!!breakdown.summary.tierDiscountPercent && breakdown.summary.tierDiscountPercent > 0 && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-emerald-600">تخفیف باشگاه مشتریان ({breakdown.summary.tierDiscountPercent}٪)</span>
						<span className="font-bold text-emerald-600">
							- {toCurrency(breakdown.summary.tierDiscountAmount ?? 0)}
							<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
						</span>
					</div>
				)}
				{breakdown.summary.taxPercent > 0 && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-neutral-500">جمع جزء</span>
						<span className="font-medium">
							{toCurrency(breakdown.summary.subtotal)}
							<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
						</span>
					</div>
				)}
				{breakdown.summary.taxPercent > 0 && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-neutral-500">مالیات ({breakdown.summary.taxPercent}٪)</span>
						<span className="font-medium">
							{toCurrency(breakdown.summary.taxPrice)}
							<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
						</span>
					</div>
				)}
				<div className="flex items-center justify-between text-sm">
					<span className="text-neutral-700 font-semibold">جمع این مدرک</span>
					<span className="font-bold text-primary">
						{toCurrency(breakdown.summary.totalPrice)}
						<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
					</span>
				</div>
				{itemDiscount && itemDiscount.itemDiscountTotal > 0 && (
					<div className="flex items-center justify-between text-sm border-t border-dashed border-success/30 pt-2 mt-1">
						<span className="text-success font-semibold">پس از کسر تخفیف</span>
						<span className="font-bold text-success">
							{toCurrency(Math.max(breakdown.summary.totalPrice - itemDiscount.itemDiscountTotal, 0))}
							<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
