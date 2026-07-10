"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { useApi } from "@/hooks/useApi";
import { AddDocumentToCartPayload, CartItem } from "@/types/cart.type";
import { useNotificationStore } from "@/stores/notification.store";
import EditFlowLayout from "@/app/(withLayout)/(protectedPages)/_orderEditFlow/editFlowLayout";

/**
 * لایوتِ فلوی ویرایشِ آیتمِ سبد خرید — مرحله‌به‌مرحله و روت-محور (مثل فلوی ثبت سفارش).
 * داده‌ی آیتم را (از استور یا API) بارگذاری و همراه با تنظیماتِ سبد به EditFlowLayout می‌دهد.
 */
export default function CartEditLayout({ children }: { children: ReactNode }) {
	const params = useParams();
	const router = useRouter();
	const cartItemId = params?.cartItemId as string;
	const { cart, setCart } = useCartStore();
	const showNotification = useNotificationStore((s) => s.showNotification);

	const storeItem = useMemo<CartItem | null>(
		() => cart?.items?.find((it) => it.cartItemId === cartItemId) ?? null,
		[cart, cartItemId]
	);
	const [fetchedItem, setFetchedItem] = useState<CartItem | null>(null);

	const getCart = useApi(async () => await CartEndpoints.getCart());
	const updateItem = useApi(async (payload: AddDocumentToCartPayload) => await CartEndpoints.updateCartItem(cartItemId, payload));

	useEffect(() => {
		if (!storeItem) getCart.fetchData();
	}, []);

	useEffect(() => {
		if (getCart.result?.success) {
			const fetchedCart = getCart.result.data?.data ?? null;
			setCart(fetchedCart);
			setFetchedItem(fetchedCart?.items?.find((it) => it.cartItemId === cartItemId) ?? null);
		}
	}, [getCart.result]);

	useEffect(() => {
		if (!updateItem.result) return;
		if (updateItem.result.success) {
			setCart(updateItem.result.data?.data ?? null);
			showNotification({ type: "success", message: "سفارش با موفقیت بروزرسانی شد" });
			router.push("/cart");
		} else {
			showNotification({ type: "error", message: updateItem.result.description ?? "بروزرسانی سفارش با خطا مواجه شد" });
		}
	}, [updateItem.result]);

	const source = storeItem ?? fetchedItem;
	const loading = !source && (getCart.loading || !getCart.result);
	const notFound = !source && !getCart.loading && !!getCart.result;

	return (
		<EditFlowLayout
			source={source}
			loading={loading}
			notFound={notFound}
			notFoundHref="/cart"
			notFoundLabel="سفارش مورد نظر یافت نشد"
			config={{
				headerTitle: "ویرایش سفارش ترجمه",
				cancelHref: "/cart",
				submitLabel: "ذخیره و بروزرسانی سفارش",
				summaryVariant: "full",
				stepBase: `/cart/${cartItemId}`,
			}}
			submit={(payload) => updateItem.fetchData(payload)}
			submitLoading={updateItem.loading}
		>
			{children}
		</EditFlowLayout>
	);
}
