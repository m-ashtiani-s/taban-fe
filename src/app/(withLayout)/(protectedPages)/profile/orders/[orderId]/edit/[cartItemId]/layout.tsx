"use client";

import { ReactNode, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
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

	const getOrder = useApi(async () => await OrderEndpoints.getOrder(orderId), true);
	const updateItem = useApi(async (payload: AddDocumentToCartPayload) => await OrderEndpoints.updateOrderItem(orderId, cartItemId, payload));

	useEffect(() => {
		getOrder.fetchData();
	}, []);

	useEffect(() => {
		if (getOrder.result?.success) {
			const order = getOrder.result.data?.data ?? null;
			const found = order?.orderedDocs?.find((it) => it.cartItemId === cartItemId) ?? null;
			if (found) setSource(found);
			else setNotFound(true);
		}
	}, [getOrder.result]);

	useEffect(() => {
		if (!updateItem.result) return;
		if (updateItem.result.success) {
			showNotification({ type: "success", message: "آیتم سفارش با موفقیت بروزرسانی شد" });
			router.push(backHref);
		} else {
			showNotification({ type: "error", message: updateItem.result.description ?? "بروزرسانی آیتم سفارش با خطا مواجه شد" });
		}
	}, [updateItem.result]);

	const loadError =
		!source && !notFound && !!getOrder.result && !getOrder.result.success && isRetryAble(getOrder.result.code) ? (
			<ErrorComponent executeFunction={() => getOrder.fetchData()} callAble errorText="دریافت اطلاعات سفارش با خطا مواجه شد" />
		) : null;
	const loading = !source && !notFound && !loadError && (getOrder.loading || !getOrder.result);

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
			submit={(payload) => updateItem.fetchData(payload)}
			submitLoading={updateItem.loading}
		>
			{children}
		</EditFlowLayout>
	);
}
