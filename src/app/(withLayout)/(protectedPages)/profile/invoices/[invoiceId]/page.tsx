"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { toCurrency } from "@/utils/string";
import { formatJalaliDate } from "@/utils/dateFormater";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconArrow, IconCheck, IconMoney, IconOrder } from "@/app/_components/icon/icons";
import { InvoiceEndpoints } from "../_api/endpoint";
import { Invoice } from "../_types/invoice.type";
import { invoiceStatusMeta } from "../_constants/invoiceStatus";

export default function InvoiceDetailPage({ params }: { params: { invoiceId: string } }) {
	const router = useRouter();
	const showNotification = useNotificationStore((s) => s.showNotification);
	const { result, resultData, fetchData, loading } = useApi(
		async (id: string) => await InvoiceEndpoints.getInvoice(id),
		true,
	);
	const pay = useApi(async (id: string) => await InvoiceEndpoints.payInvoice(id));

	useEffect(() => {
		fetchData(params.invoiceId);
	}, []);

	// TODO: موقت — تا قبل از اتصال درگاه پرداخت واقعی، فقط وضعیت صورتحساب را پرداخت‌شده می‌کند.
	const payHandler = async () => {
		const res = await pay.fetchDataResult(params.invoiceId);
		if (res.success) {
			showNotification({ type: "success", message: res.data?.message ?? "پرداخت با موفقیت انجام شد" });
			fetchData(params.invoiceId);
		} else {
			showNotification({ type: "error", message: res.description ?? "پرداخت با خطا مواجه شد" });
		}
	};

	const invoice = resultData?.data ?? null;

	if (loading && !result) {
		return (
			<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
				<TabanLoading size={26} />
				در حال دریافت اطلاعات صورتحساب...
			</div>
		);
	}

	if (!!result && !result.success && isRetryAble(result.code)) {
		return (
			<div className="flex justify-center mt-4">
				<ErrorComponent executeFunction={() => fetchData(params.invoiceId)} callAble errorText="دریافت اطلاعات صورتحساب با خطا مواجه شد" />
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
				<div className="text-sm text-neutral-500">صورتحساب مورد نظر یافت نشد</div>
				<TabanButton variant="bordered" isLink href="/profile/invoices">
					بازگشت به صورتحساب‌ها
				</TabanButton>
			</div>
		);
	}

	const meta = invoiceStatusMeta[invoice.status];

	return (
		<div className="flex flex-col gap-5">
			{/* header */}
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => router.push("/profile/invoices")}
						className="w-10 h-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 duration-150"
					>
						<IconArrow className="rotate-90 stroke-neutral-600 fill-neutral-600" width={20} height={20} />
					</button>
					<div>
						<div className="flex items-center gap-2 text-lg font-bold peyda text-primary">
							<IconMoney className="stroke-primary w-5 h-5" />
							صورتحساب #{invoice.invoiceNumber}
						</div>
						<div className="text-xs text-neutral-500 mt-0.5">{formatJalaliDate(invoice.createdAt, "yyyy/mm/dd hh:mm")}</div>
					</div>
				</div>
				<div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${meta.className}`}>
					<span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
					{meta.label}
				</div>
			</div>

			{/* pay / paid guidance */}
			<InvoiceGuidance invoice={invoice} onPay={payHandler} paying={pay.loading} />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
				{/* main */}
				<div className="lg:col-span-2 flex flex-col gap-4">
					<div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
						<div>
							<div className="text-xs text-neutral-400 mb-1">بابت</div>
							<div className="peyda font-bold text-primary">{invoice.subject}</div>
						</div>
						{invoice.description?.trim() && (
							<div className="border-t border-neutral-100 pt-3">
								<div className="text-xs text-neutral-400 mb-1">توضیحات</div>
								<div className="text-sm text-neutral-600 leading-7">{invoice.description}</div>
							</div>
						)}

						{/* items */}
						<div className="border-t border-neutral-100 pt-4">
							<div className="text-sm font-semibold peyda mb-3">ردیف‌ها</div>
							<div className="flex flex-col gap-2">
								{invoice.items.map((it, i) => (
									<div key={i} className="flex items-center justify-between gap-2 border border-neutral-100 rounded-xl px-3 py-2.5 text-sm">
										<div className="flex-1">
											<span>{it.title}</span>
											{it.quantity > 1 && <span className="text-xs text-neutral-400 mr-2">× {toCurrency(it.quantity)}</span>}
										</div>
										<div className="font-medium" dir="ltr">
											{toCurrency(it.total)} تومان
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* sidebar */}
				<div className="lg:col-span-1 flex flex-col gap-4 lg:sticky lg:top-[88px]">
					<div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3">
						<div className="text-sm font-semibold peyda pb-2 border-b border-neutral-100">جزئیات مبلغ</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-neutral-500">جمع ردیف‌ها</span>
							<span className="font-medium">{toCurrency(invoice.subtotal)} تومان</span>
						</div>
						{invoice.vatAmount > 0 && (
							<div className="flex items-center justify-between text-sm">
								<span className="text-neutral-500">مالیات بر ارزش افزوده</span>
								<span className="font-medium">{toCurrency(invoice.vatAmount)} تومان</span>
							</div>
						)}
						<div className="flex items-center justify-between border-t border-neutral-100 pt-3">
							<span className="font-bold">مبلغ کل</span>
							<span className="peyda font-bold text-lg text-primary">
								{toCurrency(invoice.totalAmount)}
								<span className="text-xs font-normal text-neutral-500 mr-1">تومان</span>
							</span>
						</div>
					</div>

					{invoice.referenceType === "order" && invoice.referenceId && (
						<Link
							href={`/profile/orders/${invoice.referenceId}`}
							className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-center justify-between gap-2 hover:border-primary/30 duration-200"
						>
							<div className="flex items-center gap-2.5">
								<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
									<IconOrder className="stroke-primary w-4 h-4" />
								</div>
								<div>
									<div className="text-xs text-neutral-400">مربوط به سفارش</div>
									<div className="text-sm font-semibold text-primary">#{invoice.referenceNumber}</div>
								</div>
							</div>
							<IconArrow className="-rotate-90 stroke-neutral-400 fill-neutral-400" width={18} height={18} />
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}

function InvoiceGuidance({ invoice, onPay, paying }: { invoice: Invoice; onPay: () => void; paying: boolean }) {
	if (invoice.status === "paid") {
		return (
			<div className="relative overflow-hidden bg-gradient-to-l from-emerald-50 to-white border border-emerald-200 rounded-2xl p-5">
				<div className="flex items-start gap-3">
					<div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
						<IconCheck className="stroke-emerald-600 w-6 h-6" />
					</div>
					<div>
						<div className="peyda font-bold text-emerald-700">این صورتحساب پرداخت شده است</div>
						<div className="text-sm mt-1 leading-7 text-emerald-700/80">
							{invoice.paidAt
								? `پرداخت در تاریخ ${formatJalaliDate(invoice.paidAt, "yyyy/mm/dd hh:mm")} با موفقیت انجام شده است.`
								: "این صورتحساب پرداخت شده است."}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (invoice.status === "issued") {
		return (
			<div className="relative overflow-hidden bg-gradient-to-l from-amber-50 to-white border border-amber-200 rounded-2xl p-5">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-start gap-3">
						<div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
							<IconMoney className="stroke-amber-600 w-6 h-6" />
						</div>
						<div>
							<div className="peyda font-bold text-amber-700">این صورتحساب در انتظار پرداخت است</div>
							<div className="text-sm mt-1 leading-7 text-amber-700/80">
								برای تسویه‌ی این صورتحساب، مبلغ را پرداخت کنید.
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<div className="text-left">
							<div className="text-xs text-neutral-500">مبلغ قابل پرداخت</div>
							<div className="peyda font-bold text-lg text-amber-700">{toCurrency(invoice.totalAmount)} تومان</div>
						</div>
						<TabanButton onClick={onPay} isLoading={paying} loadingText="در حال پرداخت...">
							پرداخت صورتحساب
						</TabanButton>
					</div>
				</div>
			</div>
		);
	}

	return null;
}
