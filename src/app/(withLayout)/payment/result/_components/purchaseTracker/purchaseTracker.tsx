"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { isLoggedIn } from "@/utils/auth";
import { tomanToRial, trackOnce } from "@/utils/analytics";
import { OrderEndpoints } from "@/app/(withLayout)/(protectedPages)/profile/orders/_api/endpoint";
import { PurchaseTrackerProps } from "./purchaseTracker.type";

// مبلغ سفارش در query درگاه نیست؛ برای value رویداد purchase یک‌بار جزئیات سفارش خوانده می‌شود
export default function PurchaseTracker({ orderId, orderNumber }: PurchaseTrackerProps) {
	const orderQuery = useQuery({
		queryKey: ["orders", "detail", orderId],
		queryFn: () => withMappedError(() => OrderEndpoints.getOrder(orderId!)),
		enabled: !!orderId && isLoggedIn(),
		retry: false,
	});

	useEffect(() => {
		const transactionId = orderNumber || orderId;
		if (!transactionId) return;
		if (orderId && isLoggedIn() && orderQuery.isPending) return;
		const order = orderQuery.data?.data;
		trackOnce(transactionId, "purchase", {
			transaction_id: String(order?.orderNumber ?? transactionId),
			value: tomanToRial(order?.finalAmount),
			currency: "IRR",
			items: order?.orderedDocs?.length ? order.orderedDocs.map((doc) => ({ item_id: doc.translationItemId, item_name: doc.translationItemTitle })) : undefined,
		});
	}, [orderQuery.isPending, orderQuery.data]);

	return null;
}
