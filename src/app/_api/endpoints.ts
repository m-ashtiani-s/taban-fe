import { WP_URL } from "@/config/global";
import { httpClient } from "@/httpClient/HttpClient";
import { PostComment } from "@/types/comment.type";
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
	uploadStorageFiles: async (files: File[], folder?: string): Promise<string[]> => {
		const formData = new FormData();
		files.forEach((file) => formData.append("files", file));

		const res = await httpClient.call<{ message: string; files: string[] }>({
			method: "POST",
			url: `/api/storage/upload`,
			baseURL: "",
			data: formData,
			params: folder ? { folder } : undefined,
		});

		return res?.data?.files ?? [];
	},
	//TODO این باید از اینجا حذف بشه تایپس هم از تایپ های عمومی حذف بشه
	getTranslationItems: async (term: string) => {
		const res = await httpClient.call<Res<TranslationItem[]>>({
			method: "GET",
			url: `v1/translation/translation-items/`,
			params: { term },
		});
		return res?.data;
	},
	getComments: async (id: number) => {
		const res = await httpClient.call<Res<PostComment[]>>({
			method: "GET",
			url: `${WP_URL}wp-json/wp/v2/comments?post_id=${id}&_embed`,
		});
		return res?.data;
	},
	submitComment: async (data: { post_id: number; author_name: string; author_email?: string; content: string }) => {
		const res = await httpClient.call<Res<unknown>>({
			method: "POST",
			url: `${WP_URL}wp-json/custom/v1/submit-comment`,
			data,
		});
		return res?.data;
	},
};
