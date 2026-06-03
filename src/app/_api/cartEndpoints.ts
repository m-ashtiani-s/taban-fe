import { httpClient } from "@/httpClient/HttpClient";
import { AddDocumentToCartPayload, Cart } from "@/types/cart.type";
import { Res } from "@/types/responseType";

export const CartEndpoints = {
	getCart: async () => {
		const res = await httpClient.call<Res<Cart>>({
			method: "GET",
			url: `v1/user/cart`,
		});
		return res?.data;
	},
	addToCart: async (payload: AddDocumentToCartPayload) => {
		const res = await httpClient.call<Res<Cart>>({
			method: "POST",
			url: `v1/user/cart`,
			data: payload,
		});
		return res?.data;
	},
	removeFromCart: async (cartItemId: string) => {
		const res = await httpClient.call<Res<Cart>>({
			method: "DELETE",
			url: `v1/user/cart/items/${cartItemId}`,
		});
		return res?.data;
	},
	updateCartItem: async (cartItemId: string, payload: AddDocumentToCartPayload) => {
		const res = await httpClient.call<Res<Cart>>({
			method: "PUT",
			url: `v1/user/cart/items/${cartItemId}`,
			data: payload,
		});
		return res?.data;
	},
	applyCoupon: async (couponCode: string) => {
		const res = await httpClient.call<Res<Cart>>({
			method: "POST",
			url: `v1/user/cart/coupon`,
			data: { couponCode },
		});
		return res?.data;
	},
	removeCoupon: async () => {
		const res = await httpClient.call<Res<Cart>>({
			method: "DELETE",
			url: `v1/user/cart/coupon`,
		});
		return res?.data;
	},
};
