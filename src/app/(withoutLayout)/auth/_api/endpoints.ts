import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";

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
};
