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
import { IconEye, IconMoney } from "@/app/_components/icon/icons";
import { InvoiceEndpoints } from "./_api/endpoint";
import { Invoice, InvoiceStatus } from "./_types/invoice.type";
import { invoiceStatusFilters, invoiceStatusMeta } from "./_constants/invoiceStatus";

const PAGE_SIZE = 10;

export default function InvoicesPage() {
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [page, setPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [totalElements, setTotalElements] = useState<number>(0);
	const [status, setStatus] = useState<InvoiceStatus | "all">("all");

	const getInvoices = useApi(
		async (p: number, st: InvoiceStatus | "all") =>
			await InvoiceEndpoints.getInvoices(st === "all" ? null : { status: st }, p, PAGE_SIZE),
		true,
	);

	useEffect(() => {
		loadInvoices(1, status);
	}, [status]);

	const loadInvoices = async (p: number, st: InvoiceStatus | "all") => {
		const res = await getInvoices.fetchDataResult(p, st);
		if (res.success) {
			const data = res.data?.data;
			const elements = (data?.elements ?? []) as Invoice[];
			setInvoices((prev) => (p === 1 ? elements : [...prev, ...elements]));
			setPage(data?.page ?? p);
			setTotalPages(data?.totalPages ?? 1);
			setTotalElements(data?.totalElements ?? 0);
		} else if (!isRetryAble(res.code)) {
			showNotification({ type: "error", message: res.description ?? "دریافت صورتحساب‌ها با خطا مواجه شد" });
		}
	};

	const initialLoading = getInvoices.loading && invoices.length === 0 && page === 1;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<IconMoney className="stroke-primary w-5 h-5" />
				</div>
				<div>
					<h1 className="peyda font-bold text-xl text-primary">صورتحساب‌های من</h1>
					<div className="text-xs text-neutral-500">
						{totalElements > 0 ? `${totalElements} صورتحساب` : "صورتحساب‌های شما"}
					</div>
				</div>
			</div>

			{/* status filter chips */}
			<div className="flex items-center gap-2 flex-wrap">
				{invoiceStatusFilters.map((f) => (
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
					در حال دریافت صورتحساب‌ها...
				</div>
			) : !!getInvoices.result && !getInvoices.result.success && isRetryAble(getInvoices.result.code) ? (
				<div className="flex justify-center mt-4">
					<ErrorComponent executeFunction={() => loadInvoices(1, status)} callAble errorText="دریافت صورتحساب‌ها با خطا مواجه شد" />
				</div>
			) : invoices.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-dashed border-neutral-200 rounded-2xl">
					<div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
						<IconMoney className="stroke-neutral-400 w-9 h-9" />
					</div>
					<div className="text-sm text-neutral-500">صورتحسابی یافت نشد</div>
				</div>
			) : (
				<>
					<div className="flex flex-col gap-4">
						{invoices.map((invoice) => (
							<InvoiceCard key={invoice.invoiceId} invoice={invoice} />
						))}
					</div>

					{page < totalPages && (
						<div className="flex justify-center mt-2">
							<TabanButton
								variant="bordered"
								onClick={() => loadInvoices(page + 1, status)}
								isLoading={getInvoices.loading}
								loadingText="در حال دریافت..."
							>
								نمایش صورتحساب‌های بیشتر
							</TabanButton>
						</div>
					)}
				</>
			)}
		</div>
	);
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
	const meta = invoiceStatusMeta[invoice.status];
	return (
		<div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm duration-200 flex flex-col gap-4">
			<div className="flex items-start justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-3">
					<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
						<IconMoney className="stroke-primary w-5 h-5" />
					</div>
					<div>
						<div className="peyda font-bold text-primary">صورتحساب #{invoice.invoiceNumber}</div>
						<div className="text-xs text-neutral-500 mt-0.5">{formatJalaliDate(invoice.createdAt, "yyyy/mm/dd hh:mm")}</div>
					</div>
				</div>
				<div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${meta.className}`}>
					<span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
					{meta.label}
				</div>
			</div>

			<div className="text-sm text-neutral-600 border-t border-dashed border-neutral-200 pt-3">{invoice.subject}</div>

			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-neutral-100 pt-3">
				<div className="flex items-center gap-1.5">
					<span className="text-xs text-neutral-500">مبلغ:</span>
					<span className="font-bold text-primary">{toCurrency(invoice.totalAmount)}</span>
					<span className="text-xs text-neutral-500">تومان</span>
				</div>
				<Link href={`/profile/invoices/${invoice.invoiceId}`} className="w-full sm:w-auto">
					<TabanButton
						variant={invoice.status === "issued" ? "contained" : "bordered"}
						className="!py-1.5 !text-sm w-full justify-center sm:w-auto"
					>
						<IconEye className={`w-4 h-4 ml-1 ${invoice.status === "issued" ? "stroke-white" : "stroke-primary"}`} />
						{invoice.status === "issued" ? "مشاهده و پرداخت" : "مشاهده جزئیات"}
					</TabanButton>
				</Link>
			</div>
		</div>
	);
}
