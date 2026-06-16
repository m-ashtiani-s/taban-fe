import { InvoiceStatus } from "../_types/invoice.type";

export const invoiceStatusMeta: Record<InvoiceStatus, { label: string; className: string; dot: string }> = {
	created: { label: "پیش‌نویس", className: "bg-neutral-100 text-neutral-500 border-neutral-200", dot: "bg-neutral-400" },
	issued: { label: "در انتظار پرداخت", className: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
	paid: { label: "پرداخت‌شده", className: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
	canceled: { label: "لغو‌شده", className: "bg-neutral-100 text-neutral-500 border-neutral-200", dot: "bg-neutral-400" },
};

// کاربر فقط صورتحساب‌های صادرشده (در انتظار پرداخت) و پرداخت‌شده را می‌بیند.
export const invoiceStatusFilters: { label: string; value: InvoiceStatus | "all" }[] = [
	{ label: "همه", value: "all" },
	{ label: "در انتظار پرداخت", value: "issued" },
	{ label: "پرداخت‌شده", value: "paid" },
];
