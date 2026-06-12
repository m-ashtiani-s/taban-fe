import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Paginate } from "@/types/paginate";
import { Passport, PassportFilters, PassportPayload } from "@/types/passport.type";

export const PassportEndpoints = {
	getPassports: async (filters: PassportFilters | null, page: number, pageSize: number) => {
		const res = await httpClient.call<Res<Paginate<Passport>>>({
			method: "GET",
			url: `v1/user/passports`,
			params: { ...filters, page, pageSize },
		});
		return res?.data;
	},
	getPassport: async (passportId: string) => {
		const res = await httpClient.call<Res<Passport>>({
			method: "GET",
			url: `v1/user/passports/${passportId}`,
		});
		return res?.data;
	},
	createPassport: async (payload: PassportPayload) => {
		const res = await httpClient.call<Res<Passport>>({
			method: "POST",
			url: `v1/user/passports`,
			data: payload,
		});
		return res?.data;
	},
	activatePassport: async (passportId: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "PUT",
			url: `v1/user/passports/${passportId}/activate`,
		});
		return res?.data;
	},
	deactivatePassport: async (passportId: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "PUT",
			url: `v1/user/passports/${passportId}/deactivate`,
		});
		return res?.data;
	},
};
