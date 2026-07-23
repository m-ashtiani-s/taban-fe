"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { Result, ResultError } from "@/types/result";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { toCurrency } from "@/utils/string";
import { formatJalaliDate } from "@/utils/dateFormater";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanAutocompleteWrapper from "@/app/_components/common/tabanAutocompleteWrapper/tabanAutocompleteWrapper";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconEye, IconOrder, IconUser } from "@/app/_components/icon/icons";
import { OrderEndpoints } from "@/app/(withLayout)/(protectedPages)/profile/orders/_api/endpoint";
import { Order, OrderStatus } from "@/app/(withLayout)/(protectedPages)/profile/orders/_types/order.type";
import { orderFlowSteps, orderStatusMeta } from "@/app/(withLayout)/(protectedPages)/profile/orders/_constants/orderStatus";
import { CustomerEndpoints } from "../../_api/endpoint";
import { Customer } from "../../_types/customer.type";

const PAGE_SIZE = 10;

const statusFilters: { label: string; value: OrderStatus | "all" }[] = [
	{ label: "همه", value: "all" },
	...orderFlowSteps.map((s) => ({ label: s.label, value: s.key })),
	{ label: "نیازمند ویرایش", value: "needs_editing" as OrderStatus },
];

type CustomerOption = { customerId: string; fullName: string };

export default function EnterpriseOrdersPage() {
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [orders, setOrders] = useState<Order[]>([]);
	const [page, setPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [status, setStatus] = useState<OrderStatus | "all">("all");
	const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);

	const queryClient = useQueryClient();
	const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
	const [ordersResult, setOrdersResult] = useState<Result<Awaited<ReturnType<typeof OrderEndpoints.getOrders>>> | null>(null);

	const customersQuery = useQuery({
		queryKey: ["enterpriseCustomers", "list", { isActive: true, page: 1, pageSize: 100 }],
		queryFn: () => withMappedError(() => CustomerEndpoints.getCustomers({ isActive: true }, 1, 100)),
		retry: false,
	});

	useEffect(() => {
		loadOrders(1, status, selectedCustomer?.customerId);
	}, [status, selectedCustomer]);

	const loadOrders = async (p: number, st: OrderStatus | "all", customerId?: string) => {
		setOrdersLoading(true);
		try {
			const data = await queryClient.fetchQuery({
				queryKey: ["enterpriseOrders", "list", { status: st, customerId: customerId ?? null, page: p, pageSize: PAGE_SIZE }],
				queryFn: () =>
					withMappedError(() =>
						OrderEndpoints.getOrders(
							// فقط سفارش‌های مربوط به مشتری‌های زیرمجموعه (نه سفارش‌های شخصیِ بدون مشتری)
							{ withCustomer: true, ...(st === "all" ? {} : { status: st }), ...(customerId ? { customerId } : {}) },
							p,
							PAGE_SIZE,
						),
					),
				retry: false,
			});
			setOrdersResult({ success: true, data });
			const inner = data?.data;
			const elements = (inner?.elements ?? []) as Order[];
			setOrders((prev) => (p === 1 ? elements : [...prev, ...elements]));
			setPage(inner?.page ?? p);
			setTotalPages(inner?.totalPages ?? 1);
		} catch (err) {
			const e = err as ResultError;
			setOrdersResult(e);
			if (!isRetryAble(e.code)) {
				showNotification({ type: "error", message: e?.description ?? "دریافت سفارش‌ها با خطا مواجه شد" });
			}
		} finally {
			setOrdersLoading(false);
		}
	};

	const customerOptions: CustomerOption[] = [
		{ customerId: "", fullName: "همه مشتریان" },
		...(((customersQuery.data?.data?.elements ?? []) as Customer[]).map((c) => ({ customerId: c.customerId, fullName: c.fullName }))),
	];

	const initialLoading = ordersLoading && orders.length === 0 && page === 1;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<IconOrder className="stroke-primary w-5 h-5" />
				</div>
				<div>
					<h1 className="peyda font-bold text-xl text-primary">سفارش‌های سازمان</h1>
					<div className="text-xs text-neutral-500">سفارش‌های ثبت‌شده توسط سازمان شما</div>
				</div>
			</div>

			{/* filters */}
			<div className="flex items-center gap-3 flex-wrap">
				<div className="flex items-center gap-2 flex-wrap">
					{statusFilters.map((f) => (
						<button
							key={f.value}
							type="button"
							onClick={() => setStatus(f.value)}
							className={`text-xs px-3 py-1.5 rounded-full border duration-150 ${
								status === f.value ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-neutral-200 hover:border-primary/40"
							}`}
						>
							{f.label}
						</button>
					))}
				</div>
				<div className="w-[220px]">
					<TabanAutocompleteWrapper
						label="فیلتر بر اساس مشتری"
						hasInitialValue
						options={customerOptions}
						selectedOption={selectedCustomer}
						setSelectedOption={(opt: any) => setSelectedCustomer(opt?.customerId ? opt : null)}
						valueField="customerId"
						displayField="fullName"
						loading={customersQuery.isFetching}
						scrolled
						height={260}
						wrapperErrorText=""
						resultStatus={true}
					/>
				</div>
			</div>

			{initialLoading ? (
				<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
					<TabanLoading size={24} />
					در حال دریافت سفارش‌ها...
				</div>
			) : !!ordersResult && !ordersResult.success && isRetryAble(ordersResult.code) ? (
				<div className="flex justify-center mt-4">
					<ErrorComponent executeFunction={() => loadOrders(1, status, selectedCustomer?.customerId)} callAble errorText="دریافت سفارش‌ها با خطا مواجه شد" />
				</div>
			) : orders.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-dashed border-neutral-200 rounded-2xl">
					<IconOrder className="stroke-neutral-400 w-12 h-12" />
					<div className="text-sm text-neutral-500">سفارشی یافت نشد</div>
					<TabanButton isLink href="/enterprise-customers/profile/orders/create">
						ثبت سفارش برای مشتری
					</TabanButton>
				</div>
			) : (
				<>
					<div className="flex flex-col gap-4">
						{orders.map((order) => {
							const meta = orderStatusMeta[order.status];
							const customer = order.customer && typeof order.customer !== "string" ? order.customer : null;
							return (
								<div key={order.orderId} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm duration-200 flex flex-col gap-4">
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

									{customer && (
										<div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-secondary/10 border border-secondary/20 rounded-lg px-3 py-2 w-fit">
											<IconUser className="stroke-secondary w-3.5 h-3.5" />
											مشتری: <span className="font-semibold text-primary">{customer.fullName}</span>
										</div>
									)}

									<div className="flex items-center justify-between border-t border-neutral-100 pt-3">
										<div className="flex items-center gap-1.5">
											<span className="text-xs text-neutral-500">مبلغ:</span>
											<span className="font-bold text-primary">{toCurrency(order.finalAmount)}</span>
											<span className="text-xs text-neutral-500">تومان</span>
										</div>
										<Link href={`/profile/orders/${order.orderId}`}>
											<TabanButton variant="bordered" className="!py-1.5 !text-sm">
												<IconEye className="stroke-primary w-4 h-4 ml-1" />
												مشاهده جزئیات
											</TabanButton>
										</Link>
									</div>
								</div>
							);
						})}
					</div>

					{page < totalPages && (
						<div className="flex justify-center mt-2">
							<TabanButton variant="bordered" onClick={() => loadOrders(page + 1, status, selectedCustomer?.customerId)} isLoading={ordersLoading} loadingText="در حال دریافت...">
								نمایش بیشتر
							</TabanButton>
						</div>
					)}
				</>
			)}
		</div>
	);
}
