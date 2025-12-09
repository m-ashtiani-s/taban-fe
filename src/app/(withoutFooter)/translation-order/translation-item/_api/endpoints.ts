import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { TranslationItemCategory } from "../../_types/translationItemCategory.type";
import { Paginate } from "@/types/paginate";
import { TranslationItem } from "@/types/translationItem.type";

export const TranslationItemsEndpoints = {
	getCategories: async () => {
		const res = await httpClient.call<Res<TranslationItemCategory[]>>({
			method: "GET",
			url: `v1/translation/translation-item-categories`,
		});
		return res?.data;
	},
	getTranslationItems: async (translationItemCategoryId?: string) => {
		const res = await httpClient.call<Res<TranslationItem[]>>({
			method: "GET",
			url: `v1/translation/translation-items`,
			params: { ...(translationItemCategoryId ? { categoryId: translationItemCategoryId } : undefined) },
		});
		return res?.data;
	},
};
