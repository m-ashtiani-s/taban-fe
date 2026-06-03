"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { toCurrency } from "@/utils/string";
import { formatJalaliDate } from "@/utils/dateFormater";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconCart, IconDocument, IconEye, IconOrder } from "@/app/_components/icon/icons";
import { OrderEndpoints } from "./_api/endpoint";
import { Order, OrderStatus } from "./_types/order.type";
import { orderStatusMeta } from "./_constants/orderStatus";
import ReorderModal from "./_components/reorderModal/reorderModal";

const PAGE_SIZE = 10;

const statusFilters: { label: string; value: OrderStatus | "all" }[] = [
	{ label: "همه", value: "all" },
	{ label: "در انتظار بررسی", value: "pending" },
	{ label: "تایید جهت پرداخت", value: "approved" },
	{ label: "پرداخت‌شده", value: "paid" },
	{ label: "در حال انجام", value: "processing" },
	{ label: "ارسال‌شده", value: "shipped" },
	{ label: "تحویل‌شده", value: "delivered" },
	{ label: "رد‌شده", value: "rejected" },
];

export default function OrdersPage() {
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [orders, setOrders] = useState<Order[]>([]);
	const [page, setPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [totalElements, setTotalElements] = useState<number>(0);
	const [status, setStatus] = useState<OrderStatus | "all">("all");
	const [reorderOrder, setReorderOrder] = useState<Order | null>(null);

	const getOrders = useApi(
		async (p: number, st: OrderStatus | "all") =>
			await OrderEndpoints.getOrders(st === "all" ? null : { status: st }, p, PAGE_SIZE),
		true,
	);

	useEffect(() => {
		loadOrders(1, status);
	}, [status]);

	const loadOrders = async (p: number, st: OrderStatus | "all") => {
		const res = await getOrders.fetchDataResult(p, st);
		if (res.success) {
			const data = res.data?.data;
			const elements = (data?.elements ?? []) as Order[];
			setOrders((prev) => (p === 1 ? elements : [...prev, ...elements]));
			setPage(data?.page ?? p);
			setTotalPages(data?.totalPages ?? 1);
			setTotalElements(data?.totalElements ?? 0);
		} else if (!isRetryAble(res.code)) {
			showNotification({ type: "error", message: res.description ?? "دریافت سفارش‌ها با خطا مواجه شد" });
		}
	};

	const initialLoading = getOrders.loading && orders.length === 0 && page === 1;

	return (
		<div className="flex flex-col gap-5">
			<ReorderModal open={!!reorderOrder} setOpen={() => setReorderOrder(null)} order={reorderOrder} />

			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<IconOrder className="stroke-primary w-5 h-5" />
				</div>
				<div>
					<h1 className="peyda font-bold text-xl text-primary">سفارش‌های من</h1>
					<div className="text-xs text-neutral-500">{totalElements > 0 ? `${totalElements} سفارش` : "تاریخچه سفارش‌های شما"}</div>
				</div>
			</div>

			{/* status filter chips */}
			<div className="flex items-center gap-2 flex-wrap">
				{statusFilters.map((f) => (
					<button
						key={f.value}
						type="button"
						onClick={() => setStatus(f.value)}
						className={`text-xs px-3 py-1.5 rounded-full border duration-150 ${
							status === f.value
								? "bg-primary text-white border-primary"
								: "bg-white text-neutral-600 border-neutral-200 hover:border-primary/40"
						}`}
					>
						{f.label}
					</button>
				))}
			</div>

			{initialLoading ? (
				<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
					<TabanLoading size={24} />
					در حال دریافت سفارش‌ها...
				</div>
			) : !!getOrders.result && !getOrders.result.success && isRetryAble(getOrders.result.code) ? (
				<div className="flex justify-center mt-4">
					<ErrorComponent executeFunction={() => loadOrders(1, status)} callAble errorText="دریافت سفارش‌ها با خطا مواجه شد" />
				</div>
			) : orders.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-dashed border-neutral-200 rounded-2xl">
					<div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
						<IconOrder className="stroke-neutral-400 w-9 h-9" />
					</div>
					<div className="text-sm text-neutral-500">سفارشی یافت نشد</div>
					<TabanButton isLink href="/new-order">
						ثبت سفارش جدید
					</TabanButton>
				</div>
			) : (
				<>
					<div className="flex flex-col gap-4">
						{orders.map((order) => (
							<OrderCard key={order.orderId} order={order} onReorder={() => setReorderOrder(order)} />
						))}
					</div>

					{page < totalPages && (
						<div className="flex justify-center mt-2">
							<TabanButton
								variant="bordered"
								onClick={() => loadOrders(page + 1, status)}
								isLoading={getOrders.loading}
								loadingText="در حال دریافت..."
							>
								نمایش سفارش‌های بیشتر
							</TabanButton>
						</div>
					)}
				</>
			)}
		</div>
	);
}

function OrderCard({ order, onReorder }: { order: Order; onReorder: () => void }) {
	const meta = orderStatusMeta[order.status];
	return (
		<div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm duration-200 flex flex-col gap-4">
			<div className="flex items-start justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-3">
					<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
						<IconOrder className="stroke-primary w-5 h-5" />
					</div>
					<div>
						<div className="peyda font-bold text-primary">سفارش #{order.orderNumber}</div>
						<div className="text-xs text-neutral-500 mt-0.5">{formatJalaliDate(order.createdAt, "yyyy/mm/dd hh:mm")}</div>
					</div>
				</div>
				<div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${meta.className}`}>
					<span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
					{meta.label}
				</div>
			</div>

			<div className="flex items-center gap-2 flex-wrap border-t border-dashed border-neutral-200 pt-3">
				{order.orderedDocs.slice(0, 3).map((doc) => (
					<div key={doc.cartItemId} className="flex items-center gap-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5">
						<IconDocument className="fill-primary/70 stroke-0 w-3.5 h-3.5" />
						{doc.translationItemTitle}
					</div>
				))}
				{order.orderedDocs.length > 3 && (
					<div className="text-xs text-neutral-400">+ {order.orderedDocs.length - 3} مورد دیگر</div>
				)}
			</div>

			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-neutral-100 pt-3">
				<div className="flex items-center gap-1.5">
					<span className="text-xs text-neutral-500">مبلغ:</span>
					<span className="font-bold text-primary">{toCurrency(order.finalAmount)}</span>
					<span className="text-xs text-neutral-500">تومان</span>
				</div>
				<div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
					<TabanButton variant="bordered" className="!py-1.5 !text-sm w-full justify-center sm:w-auto" onClick={onReorder}>
						<IconCart className="stroke-primary w-4 h-4 ml-1" />
						سفارش مجدد
					</TabanButton>
					<Link href={`/profile/orders/${order.orderId}`} className="w-full sm:w-auto">
						<TabanButton variant="bordered" className="!py-1.5 !text-sm w-full justify-center sm:w-auto">
							<IconEye className="stroke-primary w-4 h-4 ml-1" />
							مشاهده جزئیات
						</TabanButton>
					</Link>
				</div>
			</div>
		</div>
	);
}
