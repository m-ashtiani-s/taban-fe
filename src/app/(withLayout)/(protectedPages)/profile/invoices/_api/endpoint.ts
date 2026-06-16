import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Paginate } from "@/types/paginate";
import { Invoice, InvoiceFilters } from "../_types/invoice.type";

export const InvoiceEndpoints = {
	getInvoices: async (filters: InvoiceFilters | null, page: number, pageSize: number) => {
		const res = await httpClient.call<Res<Paginate<Invoice>>>({
			method: "GET",
			url: `v1/user/invoices`,
			params: { ...filters, page, pageSize },
		});
		return res?.data;
	},
	getInvoice: async (invoiceId: string) => {
		const res = await httpClient.call<Res<Invoice>>({
			method: "GET",
			url: `v1/user/invoices/${invoiceId}`,
		});
		return res?.data;
	},
	// TODO: موقت — تا قبل از اتصال درگاه پرداخت واقعی. این فقط وضعیت صورتحساب را پرداخت‌شده می‌کند.
	payInvoice: async (invoiceId: string) => {
		const res = await httpClient.call<Res<Invoice>>({
			method: "PUT",
			url: `v1/user/invoices/${invoiceId}/pay`,
		});
		return res?.data;
	},
};
