import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { TranslationItem } from "@/types/translationItem.type";
import { TranslationItemCategory } from "../_types/translationItemCategory.type";
import { RateFilters } from "../_types/rateFilters.type";
import { DynamicRate } from "../_types/dynamicRate.type";
import { Language } from "@/types/language.type";
import { CertificationRate } from "../_types/certificationRate.type";
import { JusticeInquiryRate } from "../_types/justiceInquiry.type";
import { BaseRate } from "../_types/baseRate.type";

export const TranslationEndpoints = {
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
	getLanguages: async () => {
		const res = await httpClient.call<Res<Language[]>>({
			method: "GET",
			url: `v1/translation/languages`,
		});
		return res?.data;
	},
	getBaseRate: async (filters: RateFilters | null) => {
		const res = await httpClient.call<Res<BaseRate[]>>({
			method: "GET",
			url: `v1/translation/base-rate`,
			params: { ...filters },
		});
		return res?.data;
	},
	getDynamicRates: async (filters: RateFilters | null) => {
		const res = await httpClient.call<Res<DynamicRate[]>>({
			method: "GET",
			url: `v1/translation/dynamic-rate`,
			params: { ...filters },
		});
		return res?.data;
	},
	getCertificationRates: async (filters: RateFilters | null) => {
		const res = await httpClient.call<Res<CertificationRate[]>>({
			method: "GET",
			url: `v1/translation/certification-rate`,
			params: { ...filters },
		});
		return res?.data;
	},
	getJusticeInquiriesRates: async (filters: RateFilters | null) => {
		const res = await httpClient.call<Res<JusticeInquiryRate[]>>({
			method: "GET",
			url: `v1/translation/justice-inquiry-rate`,
			params: { ...filters },
		});
		return res?.data;
	},
};
