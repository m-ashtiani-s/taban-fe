import { httpClient } from "@/httpClient/HttpClient";
import { ProfileCompletion } from "@/types/profileCompletion.type";
import { Res } from "@/types/responseType";

export const TabanEndpoints = {
	getProfileCompletionStatus: async () => {
		const res = await httpClient.call<Res<ProfileCompletion>>({
			method: "GET",
			url: `v1/user/profile-completion`,
		});
		return res?.data;
	},
};
