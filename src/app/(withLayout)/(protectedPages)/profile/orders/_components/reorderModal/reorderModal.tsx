"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { useCartStore } from "@/stores/cart";
import { useNotificationStore } from "@/stores/notification.store";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { RateCalculationRequest } from "@/types/rateCalculation.type";
import { AddDocumentToCartPayload } from "@/types/cart.type";
import { toCurrency } from "@/utils/string";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconArrow, IconCart, IconCheck, IconDocument, IconRequired, IconTranslate } from "@/app/_components/icon/icons";
import { Order, OrderedDoc } from "../../_types/order.type";

type ReorderModalProps = {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	order: Order | null;
};

export default function ReorderModal({ open, setOpen, order }: ReorderModalProps) {
	const setCart = useCartStore((s) => s.setCart);
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [selected, setSelected] = useState<OrderedDoc | null>(null);

	const calc = useApi(async (payload: RateCalculationRequest) => await TranslationEndpoints.calculateRate(payload));
	const add = useApi(async (payload: AddDocumentToCartPayload) => await CartEndpoints.addToCart(payload));

	useEffect(() => {
		if (!open) {
			setSelected(null);
			calc.setResult(null);
		}
	}, [open]);

	const selectItem = (doc: OrderedDoc) => {
		setSelected(doc);
		calc.setResult(null);
		calc.fetchData({
			translationItemId: doc.payload.translationItemId,
			languageId: doc.payload.languageId,
			documents: doc.payload.documents,
		});
	};

	const backToList = () => {
		setSelected(null);
		calc.setResult(null);
	};

	const breakdown = calc.result?.success ? (calc.result.data?.data ?? null) : null;
	const calcFailed = !!calc.result && !calc.result.success;

	const confirmAdd = async () => {
		if (!selected) return;
		const res = await add.fetchDataResult(selected.payload);
		if (res.success) {
			setCart(res.data?.data ?? null);
			showNotification({ type: "success", message: "آیتم با قیمت روز به سبد خرید اضافه شد" });
			setOpen(false);
		} else {
			showNotification({ type: "error", message: res.description ?? "افزودن به سبد خرید با خطا مواجه شد" });
		}
	};

	return (
		<TabanModal width={680} open={open} setOpen={setOpen} title="سفارش مجدد" onClose={() => setOpen(false)}>
			{/* ---------- step 1: pick an item ---------- */}
			{!selected ? (
				<div className="flex flex-col gap-4">
					<div className="text-sm text-neutral-500">
						یک آیتم از سفارش <span className="font-semibold text-primary">#{order?.orderNumber}</span> را برای افزودن
						مجدد به سبد خرید انتخاب کنید. قیمت‌ها به‌صورت روز محاسبه می‌شوند.
					</div>

					<div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto taban-scroll pl-1">
						{(order?.orderedDocs ?? []).map((doc, i) => (
							<motion.button
								key={doc.cartItemId}
								type="button"
								onClick={() => selectItem(doc)}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.04 }}
								className="group text-right relative overflow-hidden rounded-2xl border border-neutral-200 hover:border-primary p-4 duration-200 flex items-center justify-between gap-3 hover:shadow-sm"
							>
								<div className="absolute top-0 right-0 bottom-0 w-1 bg-primary/0 group-hover:bg-primary duration-200" />
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
										<IconDocument className="fill-primary stroke-0 w-5 h-5" />
									</div>
									<div className="min-w-0">
										<div className="peyda font-bold text-primary truncate">{doc.translationItemTitle}</div>
										<div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
											<IconTranslate stroke="#888" strokeWidth={0} className="fill-neutral-400 w-3.5 h-3.5" />
											{doc.languageName} · {doc.breakdown?.documents?.length ?? 0} سند
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0 text-primary group-hover:gap-3 duration-200">
									<span className="text-xs font-medium">انتخاب</span>
									<IconArrow className="stroke-primary w-4 h-4" />
								</div>
							</motion.button>
						))}
					</div>
				</div>
			) : (
				/* ---------- step 2: fresh price review ---------- */
				<div className="flex flex-col gap-4">
					<button
						type="button"
						onClick={backToList}
						className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary duration-150 w-fit"
					>
						<IconArrow className="rotate-90 stroke-current w-4 h-4" />
						بازگشت به لیست آیتم‌ها
					</button>

					{calc.loading && !calc.result ? (
						<div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-neutral-500">
							<TabanLoading size={30} />
							در حال دریافت قیمت‌های روز...
						</div>
					) : calcFailed ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.97 }}
							animate={{ opacity: 1, scale: 1 }}
							className="flex flex-col items-center text-center gap-4 py-8 px-4"
						>
							<div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
								<IconRequired viewBox="0 0 100 100" width={38} height={38} className="fill-rose-500 stroke-0" />
							</div>
							<div className="peyda font-bold text-lg text-rose-600">امکان سفارش مجدد این آیتم وجود ندارد</div>
							<div className="text-sm text-neutral-500 leading-7 max-w-sm">
								برخی از خدمات یا نرخ‌های این آیتم دیگر ارائه نمی‌شوند یا تغییر کرده‌اند. برای ثبت سفارش
								مشابه، لطفاً یک سفارش جدید ایجاد کنید.
							</div>
							<div className="flex gap-3 mt-1">
								<TabanButton variant="bordered" onClick={backToList}>
									انتخاب آیتم دیگر
								</TabanButton>
								<TabanButton isLink href="/new-order" onClick={() => setOpen(false)}>
									ثبت سفارش جدید
								</TabanButton>
							</div>
						</motion.div>
					) : breakdown ? (
						<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
							{/* item header */}
							<div className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-2xl p-4">
								<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
									<IconDocument className="fill-primary stroke-0 w-5 h-5" />
								</div>
								<div>
									<div className="peyda font-bold text-primary">{breakdown.translationItemTitle}</div>
									<div className="text-xs text-neutral-500">{breakdown.languageName}</div>
								</div>
							</div>

							{/* per-document breakdown */}
							<div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto taban-scroll pl-1">
								{breakdown.documents.map((doc) => (
									<div key={doc.documentKey} className="border border-neutral-200 rounded-xl p-3 flex flex-col gap-2">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5 text-sm font-bold text-secondary">
												<div className="w-2 h-2 rounded bg-primary/70 rotate-45" />
												{doc.title}
												{(doc.copyCount ?? 1) > 1 && (
													<span className="text-[10px] text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded mr-1">
														× {convertToPersianNumber(String(doc.copyCount))} نسخه
													</span>
												)}
											</div>
											<div className="font-semibold text-sm">{toCurrency(doc.documentTotal)} تومان</div>
										</div>
										<div className="flex flex-col gap-1 text-xs text-neutral-500">
											<div className="flex justify-between">
												<span>{doc.base.title || "نرخ پایه"} × {doc.base.count}</span>
												<span>{toCurrency(doc.base.total)} تومان</span>
											</div>
											{doc.specials.map((s) => (
												<div key={s.dynamicRateId} className="flex justify-between">
													<span>{s.label} × {s.count}</span>
													<span>{toCurrency(s.total)} تومان</span>
												</div>
											))}
											{doc.mfaCertification && (
												<div className="flex justify-between">
													<span>مهر وزارت امور خارجه</span>
													<span>{toCurrency(doc.mfaCertification.price)} تومان</span>
												</div>
											)}
											{doc.justiceCertification && (
												<div className="flex justify-between">
													<span>مهر دادگستری</span>
													<span>{toCurrency(doc.justiceCertification.price)} تومان</span>
												</div>
											)}
											{doc.embassyApprovals?.map((e) => (
													<div key={e.embassyRateId} className="flex justify-between">
														<span>{e.embassyName}</span>
														<span>{toCurrency(e.price)} تومان</span>
													</div>
												))}
												{doc.justiceInquiries.map((iq) => (
												<div key={iq.justiceInquiryRateId} className="flex justify-between">
													<span>{iq.justiceInquiryName}</span>
													<span>{toCurrency(iq.price)} تومان</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div>

							{/* summary */}
							<div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4 flex flex-col gap-2 text-sm">
								<div className="flex justify-between">
									<span className="text-neutral-500">مبلغ ترجمه</span>
									<span className="font-medium">{toCurrency(breakdown.summary.translationPrice)} تومان</span>
								</div>
								<div className="flex justify-between">
									<span className="text-neutral-500">مبلغ تاییدات</span>
									<span className="font-medium">{toCurrency(breakdown.summary.certificationPrice)} تومان</span>
								</div>
								<div className="flex justify-between">
									<span className="text-neutral-500">مبلغ استعلام‌ها</span>
									<span className="font-medium">{toCurrency(breakdown.summary.inquiryPrice)} تومان</span>
									</div>
									<div className="flex justify-between">
										<span className="text-neutral-500">مبلغ تایید سفارت</span>
										<span className="font-medium">{toCurrency(breakdown.summary.embassyPrice ?? 0)} تومان</span>
								</div>
								{breakdown.summary.taxPercent > 0 && (
									<>
								<div className="flex justify-between">
									<span className="text-neutral-500">مالیات ({breakdown.summary.taxPercent}٪)</span>
									<span className="font-medium">{toCurrency(breakdown.summary.taxPrice)} تومان</span>
								</div>
									</>
								)}
								<div className="border-t border-neutral-200 mt-1 pt-2 flex items-center justify-between">
									<span className="font-bold">مبلغ کل (قیمت روز)</span>
									<span className="peyda font-bold text-lg text-primary">
										{toCurrency(breakdown.summary.totalPrice)}
										<span className="text-xs font-normal text-neutral-500 mr-1">تومان</span>
									</span>
								</div>
							</div>

							<div className="flex flex-row gap-3">
								<TabanButton variant="bordered" onClick={backToList} disabled={add.loading} className="flex-1 justify-center">
									انصراف
								</TabanButton>
								<TabanButton onClick={confirmAdd} isLoading={add.loading} loadingText="در حال افزودن..." className="flex-1 justify-center">
									<IconCart className="stroke-white w-5 h-5 ml-2" />
									افزودن به سبد خرید
								</TabanButton>
							</div>
						</motion.div>
					) : null}
				</div>
			)}
		</TabanModal>
	);
}
