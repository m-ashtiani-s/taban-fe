"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { useApi } from "@/hooks/useApi";
import { AppliedCoupon, AppliedCouponItemDiscount, CartItem } from "@/types/cart.type";
import { toCurrency } from "@/utils/string";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconCart, IconDocument, IconEdit, IconRecycle, IconTranslate } from "@/app/_components/icon/icons";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import Link from "next/link";
import CartCoupon from "./_components/cartCoupon/cartCoupon";

export default function CartPage() {
	const { cart, setCart } = useCartStore();
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [deleteTarget, setDeleteTarget] = useState<CartItem | null>(null);

	const getCart = useApi(async () => await CartEndpoints.getCart(), true);

	const removeItem = useApi(async (cartItemId: string) => await CartEndpoints.removeFromCart(cartItemId));

	useEffect(() => {
		getCart.fetchData();
	}, []);

	useEffect(() => {
		if (getCart.result?.success) {
			setCart(getCart.result.data?.data ?? null);
		}
	}, [getCart.result]);

	useEffect(() => {
		if (removeItem.result) {
			if (removeItem.result.success) {
				setCart(removeItem.result.data?.data ?? null);
				setDeleteTarget(null);
				showNotification({ type: "success", message: "ترجمه با موفقیت از سبد خرید حذف شد" });
			} else {
				showNotification({
					type: "error",
					message: removeItem.result.description ?? "حذف با خطا مواجه شد",
				});
			}
		}
	}, [removeItem.result]);

	const items = cart?.items ?? [];
	const isLoading = getCart.loading && !getCart.result;

	return (
		<div className="flex flex-col gap-6 pt-16 max-lg:pt-8 max-lg:px-4">
			<TabanModal
				open={!!deleteTarget}
				setOpen={(v) => !v && setDeleteTarget(null)}
				title="حذف از سبد خرید"
				onClose={() => setDeleteTarget(null)}
			>
				<div className="flex flex-col gap-4">
					<div className="text-sm text-neutral-600 leading-7">
						آیا از حذف <span className="font-semibold text-primary">{deleteTarget?.breakdown?.translationItemTitle}</span>{" "}
						از سبد خرید مطمئن هستید؟
					</div>
					<div className="flex justify-end gap-3">
						<TabanButton variant="bordered" onClick={() => setDeleteTarget(null)}>
							انصراف
						</TabanButton>
						<TabanButton
							className="!bg-error !border-error"
							isLoading={removeItem.loading}
							disabled={removeItem.loading}
							onClick={() => deleteTarget && removeItem.fetchData(deleteTarget.cartItemId)}
						>
							بله، حذف شود
						</TabanButton>
					</div>
				</div>
			</TabanModal>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
						<IconCart stroke="#1a3047" className="w-5 h-5" />
					</div>
					<div>
						<h1 className="peyda font-bold text-xl text-primary">سبد خرید</h1>
						<div className="text-xs text-neutral-500">
							{items.length > 0 ? `${items.length} ترجمه در سبد خرید` : "سبد خرید شما خالی است"}
						</div>
					</div>
				</div>
				{items.length > 0 && (
					<TabanButton isLink href="/new-order">
						<IconTranslate stroke="white" strokeWidth={0} className="fill-white w-4 h-4 ml-1" />
						ثبت ترجمه جدید
					</TabanButton>
				)}
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
					<TabanLoading size={24} />
					در حال دریافت سبد خرید...
				</div>
			) : getCart.result && !getCart.result.success && isRetryAble(getCart.result.code) ? (
				<ErrorComponent executeFunction={() => getCart.fetchData()} callAble errorText="دریافت سبد خرید با خطا مواجه شد" />
			) : items.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-6 py-20 bg-white border border-neutral-200 rounded-2xl">
					<div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center">
						<IconCart stroke="#aaa" className="w-10 h-10" />
					</div>
					<div className="text-center">
						<div className="peyda font-bold text-lg text-neutral-500 mb-1">سبد خرید خالی است</div>
						<div className="text-sm text-neutral-400">هنوز سفارش ترجمه‌ای ثبت نکرده‌اید</div>
					</div>
					<TabanButton isLink href="/new-order">
						ثبت سفارش ترجمه
					</TabanButton>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{items.map((item) => (
						<CartItemCard
							key={item.cartItemId}
							item={item}
							itemDiscount={
								cart?.appliedCoupon?.itemDiscounts?.find((d) => d.cartItemId === item.cartItemId) ?? null
							}
							appliedCoupon={cart?.appliedCoupon ?? null}
							onDelete={() => setDeleteTarget(item)}
						/>
					))}

					<CartCoupon cart={cart} onCartChange={setCart} />

					<div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
						<div className="flex flex-col gap-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-neutral-500">جمع کل</span>
								<span className="font-medium">
									{toCurrency(cart?.cartSum ?? 0)}
									<span className="text-xs font-normal text-neutral-500 mr-1">تومان</span>
								</span>
							</div>
							{(cart?.cartSum ?? 0) - (cart?.cartSumWithDiscount ?? cart?.cartSum ?? 0) > 0 && (
								<div className="flex items-center justify-between text-success">
									<span>تخفیف</span>
									<span className="font-medium">
										- {toCurrency((cart?.cartSum ?? 0) - (cart?.cartSumWithDiscount ?? 0))}
										<span className="text-xs font-normal text-neutral-500 mr-1">تومان</span>
									</span>
								</div>
							)}
						</div>
						<div className="flex flex-row items-start sm:items-center justify-between gap-4 border-t border-neutral-100 pt-4">
							<div className="flex flex-col gap-1">
								<div className="text-sm text-neutral-500">مبلغ قابل پرداخت</div>
								<div className="peyda font-bold text-2xl text-primary flex items-center gap-2">
									{toCurrency(cart?.cartSumWithDiscount ?? cart?.cartSum ?? 0)}
									<span className="text-sm font-normal text-neutral-500">تومان</span>
								</div>
							</div>
							<TabanButton isLink href="/cart/checkout" className="!px-8">
								نهایی کردن سفارش
							</TabanButton>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function CartItemCard({
	item,
	itemDiscount,
	appliedCoupon,
	onDelete,
}: {
	item: CartItem;
	itemDiscount: AppliedCouponItemDiscount | null;
	appliedCoupon: AppliedCoupon | null;
	onDelete: () => void;
}) {
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
				<div className="flex items-center justify-between text-sm">
					<span className="text-neutral-500">جمع جزء</span>
					<span className="font-medium">
						{toCurrency(breakdown.summary.subtotal)}
						<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
					</span>
				</div>
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
