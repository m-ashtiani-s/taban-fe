import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Paginate } from "@/types/paginate";
import { AddDocumentToCartPayload } from "@/types/cart.type";
import { CreateOrderPayload, Order, OrderFilters } from "../_types/order.type";

export const OrderEndpoints = {
	createOrder: async (payload: CreateOrderPayload) => {
		const res = await httpClient.call<Res<Order>>({
			method: "POST",
			url: `v1/user/orders`,
			data: payload,
		});
		return res?.data;
	},
	getOrders: async (filters: OrderFilters | null, page: number, pageSize: number) => {
		const res = await httpClient.call<Res<Paginate<Order>>>({
			method: "GET",
			url: `v1/user/orders`,
			params: { ...filters, page, pageSize },
		});
		return res?.data;
	},
	getOrder: async (orderId: string) => {
		const res = await httpClient.call<Res<Order>>({
			method: "GET",
			url: `v1/user/orders/${orderId}`,
		});
		return res?.data;
	},
	// دانلود فاکتور PDF سفارش (تنها برای سفارش‌های پرداخت‌شده). خروجی به‌صورت Blob دریافت می‌شود.
	downloadInvoice: async (orderId: string): Promise<Blob> => {
		const res = await httpClient.call<Blob>({
			method: "GET",
			url: `v1/user/orders/${orderId}/invoice`,
			responseType: "blob",
		});
		return res?.data as Blob;
	},
	// TODO: موقت — تا قبل از اتصال درگاه پرداخت واقعی. این فقط وضعیت سفارش را پرداخت‌شده می‌کند.
	payOrder: async (orderId: string) => {
		const res = await httpClient.call<Res<Order>>({
			method: "PUT",
			url: `v1/user/orders/${orderId}/pay`,
		});
		return res?.data;
	},
	updateOrderItem: async (orderId: string, cartItemId: string, payload: AddDocumentToCartPayload) => {
		const res = await httpClient.call<Res<Order>>({
			method: "PUT",
			url: `v1/user/orders/${orderId}/items/${cartItemId}`,
			data: payload,
		});
		return res?.data;
	},
	removeCoupon: async (orderId: string) => {
		const res = await httpClient.call<Res<Order>>({
			method: "DELETE",
			url: `v1/user/orders/${orderId}/coupon`,
		});
		return res?.data;
	},
};
