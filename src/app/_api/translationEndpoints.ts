import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { TranslationItem } from "@/types/translationItem.type";
import { Language } from "@/types/language.type";
import { TranslationItemCategory } from "@/types/translationItemCategory.type";
import { RateFilters } from "@/types/rateFilters.type";
import { BaseRate } from "@/types/baseRate.type";
import { DynamicRate } from "@/types/dynamicRate.type";
import { CertificationRate } from "@/types/certificationRate.type";
import { JusticeInquiryRate } from "@/types/justiceInquiry.type";
import { EmbassyRate } from "@/types/embassyRate.type";
import { RateCalculationRequest, RateCalculationResponse } from "@/types/rateCalculation.type";

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
	getEmbassyRates: async (filters: RateFilters | null) => {
		const res = await httpClient.call<Res<EmbassyRate[]>>({
			method: "GET",
			url: `v1/translation/embassy-rate`,
			params: { ...filters },
		});
		return res?.data;
	},
	calculateRate: async (payload: RateCalculationRequest) => {
		const res = await httpClient.call<Res<RateCalculationResponse>>({
			method: "POST",
			url: `v1/translation/rate-calculator`,
			data: payload,
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
};
