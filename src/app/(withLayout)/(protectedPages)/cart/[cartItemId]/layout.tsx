"use client";

import { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { withMappedError } from "@/utils/withMappedError";
import { AddDocumentToCartPayload } from "@/types/cart.type";
import { useNotificationStore } from "@/stores/notification.store";
import EditFlowLayout from "@/app/(withLayout)/(protectedPages)/_orderEditFlow/editFlowLayout";

/**
 * لایوتِ فلوی ویرایشِ آیتمِ سبد خرید — مرحله‌به‌مرحله و روت-محور (مثل فلوی ثبت سفارش).
 * داده‌ی آیتم را بارگذاری و همراه با تنظیماتِ سبد به EditFlowLayout می‌دهد.
 */
export default function CartEditLayout({ children }: { children: ReactNode }) {
	const params = useParams();
	const router = useRouter();
	const cartItemId = params?.cartItemId as string;

	const showNotification = useNotificationStore((s) => s.showNotification);

	const queryClient = useQueryClient();

	const cartQuery = useQuery({
		queryKey: ["cart", "detail"],
		queryFn: () => withMappedError(() => CartEndpoints.getCart()),
		staleTime: 3_000,
		meta: { showNotification: true },
	});

	const { mutate: updateItem, isPending: updateItemPending } = useMutation({
		mutationFn: (payload: AddDocumentToCartPayload) =>
			withMappedError(() => CartEndpoints.updateCartItem(cartItemId, payload)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			queryClient.setQueryData(["cart", "detail"], data);
			showNotification({ type: "success", message: "سفارش با موفقیت بروزرسانی شد" });
			router.push("/cart");
		},
	});

	const source = cartQuery.data?.data?.items?.find((it) => it.cartItemId === cartItemId) ?? null;
	const loading = cartQuery.isPending;
	// خطای دریافت سبد هم به همان صفحه‌ی «یافت نشد» می‌رسد، وگرنه با source خالی چیزی رندر نمی‌شود
	const notFound = !loading && !source;

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
			submit={(payload) => updateItem(payload)}
			submitLoading={updateItemPending}
		>
			{children}
		</EditFlowLayout>
	);
}
