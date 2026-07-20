"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { withMappedError } from "@/utils/withMappedError";
import { CartItem } from "@/types/cart.type";
import { toCurrency } from "@/utils/string";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconCart, IconTranslate } from "@/app/_components/icon/icons";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import CartCoupon from "./_components/cartCoupon/cartCoupon";
import CartItemCard from "./_components/cartItemCard/cartItemCard";

export default function CartPage() {
	const [deleteTarget, setDeleteTarget] = useState<CartItem | null>(null);
	const showNotification = useNotificationStore((s) => s.showNotification);

	const queryClient = useQueryClient();

	const cartQuery = useQuery({
		queryKey: ["cart", "detail"],
		queryFn: () => withMappedError(() => CartEndpoints.getCart()),
		staleTime: 3_000,
		meta: { showNotification: true },
	});

	const { mutate: removeItem, isPending: removeItemPending } = useMutation({
		mutationFn: (cartItemId: string) => withMappedError(() => CartEndpoints.removeFromCart(cartItemId)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			queryClient.setQueryData(["cart", "detail"], data);
			setDeleteTarget(null);
			showNotification({ type: "success", message: "ترجمه با موفقیت از سبد خرید حذف شد" });
		},
	});

	const cart = cartQuery.data?.data ?? null;
	const items = cart?.items ?? [];

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
							isLoading={removeItemPending}
							disabled={removeItemPending}
							onClick={() => deleteTarget && removeItem(deleteTarget.cartItemId)}
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

			{cartQuery.isPending ? (
				<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
					<TabanLoading size={24} />
					در حال دریافت سبد خرید...
				</div>
			) : !!cartQuery.error && isRetryAble(cartQuery.error.code) ? (
				<ErrorComponent
					executeFunction={() => cartQuery.refetch()}
					callAble
					errorText="دریافت سبد خرید با خطا مواجه شد"
				/>
			) : !cartQuery.error && items.length === 0 ? (
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
			) : !cartQuery.error && !!cartQuery.data ? (
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

					<CartCoupon cart={cart} />

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
			) : null}
		</div>
	);
}
