import { httpClient } from "@/httpClient/HttpClient";
import { Profile } from "@/types/profile.type";
import { ProfileCompletion } from "@/types/profileCompletion.type";
import { Res } from "@/types/responseType";
import { TranslationItem } from "@/types/translationItem.type";

export const TabanEndpoints = {
	getProfile: async () => {
		const res = await httpClient.call<Res<Profile>>({
			method: "GET",
			url: `v1/user`,
		});
		return res?.data;
	},
	getProfileCompletionStatus: async () => {
		const res = await httpClient.call<Res<ProfileCompletion>>({
			method: "GET",
			url: `v1/user/profile-completion`,
		});
		return res?.data;
	},
	//TODO این باید از اینجا حذف بشه تایپس هم از تایپ های عمومی حذف بشه
	getTranslationItems: async (term:string) => {
		const res = await httpClient.call<Res<TranslationItem[]>>({
			method: "GET",
			url: `v1/translation/translation-items`,
			params:{term}
		});
		return res?.data;
	},
};
