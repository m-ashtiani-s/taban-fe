"use client";

import { ReactNode, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { AddDocumentToCartPayload } from "@/types/cart.type";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { useNotificationStore } from "@/stores/notification.store";
import EditFlowLayout from "@/app/(withLayout)/(protectedPages)/_orderEditFlow/editFlowLayout";
import { OrderEndpoints } from "../../../_api/endpoint";
import { OrderedDoc } from "../../../_types/order.type";

/**
 * لایوتِ فلوی ویرایشِ آیتمِ سفارش — مرحله‌به‌مرحله و روت-محور (مثل فلوی ثبت سفارش).
 * سفارش را واکشی، آیتمِ موردنظر را پیدا و همراه با تنظیماتِ سفارش به EditFlowLayout می‌دهد.
 */
export default function OrderItemEditLayout({ children }: { children: ReactNode }) {
	const params = useParams();
	const router = useRouter();
	const orderId = params?.orderId as string;
	const cartItemId = params?.cartItemId as string;
	const backHref = `/profile/orders/${orderId}`;
	const showNotification = useNotificationStore((s) => s.showNotification);

	const [source, setSource] = useState<OrderedDoc | null>(null);
	const [notFound, setNotFound] = useState(false);

	const orderQuery = useQuery({
		queryKey: ["orders", "detail", orderId],
		queryFn: () => withMappedError(() => OrderEndpoints.getOrder(orderId)),
		retry: false,
	});
	const { mutate: updateItem, isPending: updatePending } = useMutation({
		mutationFn: (payload: AddDocumentToCartPayload) => withMappedError(() => OrderEndpoints.updateOrderItem(orderId, cartItemId, payload)),
		meta: { showNotification: true },
		onSuccess: () => {
			showNotification({ type: "success", message: "آیتم سفارش با موفقیت بروزرسانی شد" });
			router.push(backHref);
		},
	});

	const getOrderResult =
		orderQuery.error ?? (orderQuery.data !== undefined ? { success: true as const, data: orderQuery.data } : null);

	useEffect(() => {
		if (orderQuery.data) {
			const order = orderQuery.data?.data ?? null;
			const found = order?.orderedDocs?.find((it) => it.cartItemId === cartItemId) ?? null;
			if (found) setSource(found);
			else setNotFound(true);
		}
	}, [orderQuery.data]);

	const loadError =
		!source && !notFound && !!getOrderResult && !getOrderResult.success && isRetryAble(getOrderResult.code) ? (
			<ErrorComponent executeFunction={() => orderQuery.refetch()} callAble errorText="دریافت اطلاعات سفارش با خطا مواجه شد" />
		) : null;
	const loading = !source && !notFound && !loadError && (orderQuery.isFetching || !getOrderResult);

	return (
		<EditFlowLayout
			source={source}
			loading={loading}
			loadError={loadError}
			notFound={notFound}
			notFoundHref={backHref}
			notFoundLabel="آیتم سفارش مورد نظر یافت نشد"
			config={{
				headerTitle: "ویرایش آیتم سفارش",
				cancelHref: backHref,
				submitLabel: "ذخیره و بروزرسانی آیتم",
				summaryVariant: "compact",
				stepBase: `/profile/orders/${orderId}/edit/${cartItemId}`,
			}}
			submit={(payload) => updateItem(payload)}
			submitLoading={updatePending}
		>
			{children}
		</EditFlowLayout>
	);
}
