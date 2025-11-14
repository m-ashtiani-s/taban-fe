import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Login } from "../_types/login.type";
import { CompleteProfileFormValues } from "../_types/completeProfileFormValues.type";
import { Paginate } from "@/types/paginate";
import { Province } from "@/types/Province.type";
import { City } from "@/types/city.type";

export const AuthEndpoints = {
	checkUsername: async (username: string) => {
		const res = await httpClient.call<Res<boolean>>({
			method: "GET",
			url: `v1/auth/check-username`,
			params: { username },
		});
		return res?.data;
	},
	sendOTP: async (username: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "POST",
			url: `v1/auth/sign-up/otp/send`,
			data: { username },
		});
		return res?.data;
	},
	login: async (username: string, password: string) => {
		const res = await httpClient.call<Res<Login>>({
			method: "POST",
			url: `v1/auth/login`,
			data: { username, password },
		});
		return res?.data;
	},
	checkOTP: async (username: string, otp: string) => {
		const res = await httpClient.call<Res<boolean>>({
			method: "POST",
			url: `v1/auth/sign-up/otp/check`,
			data: { username, otp },
		});
		return res?.data;
	},
	setPassword: async (username: string, password: string) => {
		const res = await httpClient.call<Res<Login>>({
			method: "POST",
			url: `v1/auth/sign-up/set-password`,
			data: { username, password },
		});
		return res?.data;
	},
	completeProfile: async (completeProfileFormValues: CompleteProfileFormValues) => {
		const res = await httpClient.call<Res<null>>({
			method: "PUT",
			url: `v1/user`,
			data: completeProfileFormValues,
		});
		return res?.data;
	},
	getProvinces: async (term: string) => {
		const res = await httpClient.call<Res<Paginate<Province>>>({
			method: "GET",
			url: `v1/provinces`,
			params: { term },
		});
		return res?.data;
	},
	getCities: async (term: string, provinceId?: number) => {
		const res = await httpClient.call<Res<Paginate<City>>>({
			method: "GET",
			url: `v1/cities`,
			params: { term, provinceId },
		});
		return res?.data;
	},
};
