import { AddDocumentToCartPayload } from "@/types/cart.type";
import { RateCalculationDocumentInput, RateCalculationRequest } from "@/types/rateCalculation.type";
import { EditState } from "../editFlow.type";

/** ساخت درخواستِ محاسبه‌ی نرخ از روی state ویرایش (تابع خالص) */
export function buildCalcPayload(editState: EditState): RateCalculationRequest | null {
	const documentKeys = Object.keys(editState.translationItemNames);
	if (documentKeys.length === 0) return null;
	const documents: RateCalculationDocumentInput[] = documentKeys.map((key) => ({
		documentKey: key,
		title: editState.translationItemNames[key],
		baseRateCount: Number(editState.baseRateCount[key] ?? 1) || 1,
		specials: Object.entries(editState.specialItems[key] ?? {})
			.filter(([, cnt]) => Number(cnt) > 0)
			.map(([dynamicRateId, cnt]) => ({ dynamicRateId, count: Number(cnt) })),
		copyCount: Number(editState.copyCount[key] ?? 1) || 1,
		assets: editState.assetsByDoc[key] ?? [],
		mfaCertificationRateId: editState.mfaCertification[key] ?? null,
		justiceCertificationRateId: editState.justiceCertification[key] ?? null,
		justiceInquiryRateIds:
			editState.justiceCertification[key] && !editState.selfInquiry[key] ? (editState.justiceInquiries[key] ?? []) : [],
		embassyRateIds:
			editState.justiceCertification[key] && editState.mfaCertification[key] ? editState.embassies[key] ?? [] : [],
		selfInquiry: !!editState.selfInquiry[key],
		scanRateId: editState.scanRateIdByDoc[key] ?? null,
		description: editState.descriptionByDoc[key]?.trim() || undefined,
	}));
	return { translationItemId: editState.translationItemId, languageId: editState.languageId, documents, isOfficial: editState.isOfficial };
}

/** ساخت payload نهاییِ بروزرسانی (calcPayload + فایل‌ها و تاریخِ تحویل) */
export function buildUpdatePayload(editState: EditState): AddDocumentToCartPayload | null {
	const calcPayload = buildCalcPayload(editState);
	if (!calcPayload) return null;
	return {
		...calcPayload,
		passports: editState.passports,
		assets: Object.values(editState.assetsByDoc).flat(),
		desiredDeliveryDate: editState.desiredDeliveryDate,
		isOfficial: editState.isOfficial,
	};
}
