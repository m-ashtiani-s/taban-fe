import { Language } from "@/types/language.type";
import { UpdateUserPayload } from "../_types/updateUserPayload.type";
import { Res } from "@/types/responseType";
import { httpClient } from "@/httpClient/HttpClient";

export const ProfileEndpoints = {
	updateUser: async (payload: UpdateUserPayload) => {
		const res = await httpClient.call<Res<null>>({
			method: "PUT",
			url: `v1/user`,
			data: payload,
		});
		return res?.data;
	},
	getLanguages: async () => {
		const res = await httpClient.call<Res<Language[]>>({
			method: "GET",
			url: `v1/translation/languages`,
		});
		return res?.data;
	},
};
