import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Paginate } from "@/types/paginate";
import { Province } from "@/types/Province.type";
import { City } from "@/types/city.type";
import { ShippingAddress, ShippingAddressFilters, ShippingAddressPayload } from "../_types/shippingAddress.type";

export const ShippingAddressEndpoints = {
	getShippingAddresses: async (filters: ShippingAddressFilters | null, page: number, pageSize: number) => {
		const res = await httpClient.call<Res<Paginate<ShippingAddress>>>({
			method: "GET",
			url: `v1/user/shipping-addresses`,
			params: { ...filters, page, pageSize },
		});
		return res?.data;
	},
	getShippingAddress: async (shippingAddressId: string) => {
		const res = await httpClient.call<Res<ShippingAddress>>({
			method: "GET",
			url: `v1/user/shipping-addresses/${shippingAddressId}`,
		});
		return res?.data;
	},
	createShippingAddress: async (payload: ShippingAddressPayload) => {
		const res = await httpClient.call<Res<ShippingAddress>>({
			method: "POST",
			url: `v1/user/shipping-addresses`,
			data: payload,
		});
		return res?.data;
	},
	updateShippingAddress: async (shippingAddressId: string, payload: ShippingAddressPayload) => {
		const res = await httpClient.call<Res<ShippingAddress>>({
			method: "PUT",
			url: `v1/user/shipping-addresses/${shippingAddressId}`,
			data: payload,
		});
		return res?.data;
	},
	activateShippingAddress: async (shippingAddressId: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "PUT",
			url: `v1/user/shipping-addresses/${shippingAddressId}/activate`,
		});
		return res?.data;
	},
	deactivateShippingAddress: async (shippingAddressId: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "PUT",
			url: `v1/user/shipping-addresses/${shippingAddressId}/deactivate`,
		});
		return res?.data;
	},
	getProvinces: async (term: string) => {
		const res = await httpClient.call<Res<Paginate<Province>>>({
			method: "GET",
			url: `v1/provinces`,
			params: { term, pageSize: 100 },
		});
		return res?.data;
	},
	getCities: async (term: string, provinceId?: number) => {
		const res = await httpClient.call<Res<Paginate<City>>>({
			method: "GET",
			url: `v1/cities`,
			params: { term, provinceId, pageSize: 1000 },
		});
		return res?.data;
	},
};
