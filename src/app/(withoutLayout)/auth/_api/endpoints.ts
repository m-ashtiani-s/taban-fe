import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Login } from "../_types/login.type";

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
			params: { username },
		});
		return res?.data;
	},
	login: async (username: string, password: string) => {
		const res = await httpClient.call<Res<Login>>({
			method: "POST",
			url: `v1/auth/login`,
			params: { username, password },
		});
		return res?.data;
	},
};
