import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Paginate } from "@/types/paginate";
import { Province } from "@/types/Province.type";
import { City } from "@/types/city.type";
import { EnterpriseCustomer, EnterpriseCustomerPayload } from "../_types/enterpriseCustomer.type";
import { Customer, CustomerFilters, CustomerPayload } from "../_types/customer.type";

export const EnterpriseCustomerEndpoints = {
	getMyEnterpriseCustomer: async () => {
		const res = await httpClient.call<Res<EnterpriseCustomer>>({
			method: "GET",
			url: `v1/user/enterprise-customers/me`,
		});
		return res?.data;
	},
	register: async (payload: EnterpriseCustomerPayload) => {
		const res = await httpClient.call<Res<EnterpriseCustomer>>({
			method: "POST",
			url: `v1/user/enterprise-customers`,
			data: payload,
		});
		return res?.data;
	},
};

export const CustomerEndpoints = {
	getCustomers: async (filters: CustomerFilters | null, page: number, pageSize: number) => {
		const res = await httpClient.call<Res<Paginate<Customer>>>({
			method: "GET",
			url: `v1/user/customers`,
			params: { ...filters, page, pageSize },
		});
		return res?.data;
	},
	getCustomer: async (customerId: string) => {
		const res = await httpClient.call<Res<Customer>>({
			method: "GET",
			url: `v1/user/customers/${customerId}`,
		});
		return res?.data;
	},
	createCustomer: async (payload: CustomerPayload) => {
		const res = await httpClient.call<Res<Customer>>({
			method: "POST",
			url: `v1/user/customers`,
			data: payload,
		});
		return res?.data;
	},
	updateCustomer: async (customerId: string, payload: CustomerPayload) => {
		const res = await httpClient.call<Res<Customer>>({
			method: "PUT",
			url: `v1/user/customers/${customerId}`,
			data: payload,
		});
		return res?.data;
	},
	activateCustomer: async (customerId: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "PUT",
			url: `v1/user/customers/${customerId}/activate`,
		});
		return res?.data;
	},
	deactivateCustomer: async (customerId: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "PUT",
			url: `v1/user/customers/${customerId}/deactivate`,
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
