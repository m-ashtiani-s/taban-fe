import { EditSource, EditState } from "../editFlow.type";

/**
 * ساخت state اولیه‌ی ویرایش از روی آیتمِ ذخیره‌شده (سبد خرید یا آیتمِ سفارش).
 * ساختار هر دو منبع یکسان است (`{ payload, breakdown }`) پس یک سازنده کافی است.
 */
export function buildEditState(source: EditSource): EditState {
	const { payload, breakdown } = source;
	const translationItemNames: Record<string, string> = {};
	const baseRateCount: Record<string, string> = {};
	const specialItems: Record<string, Record<string, string>> = {};
	const mfaCertification: Record<string, string | null> = {};
	const justiceCertification: Record<string, string | null> = {};
	const justiceInquiries: Record<string, string[]> = {};
	const selfInquiry: Record<string, boolean> = {};
	const embassies: Record<string, string[]> = {};
	const copyCount: Record<string, string> = {};
	const scanRateIdByDoc: Record<string, string | null> = {};
	const assetsByDoc: Record<string, string[]> = {};
	const descriptionByDoc: Record<string, string> = {};

	payload.documents.forEach((doc) => {
		translationItemNames[doc.documentKey] = doc.title;
		baseRateCount[doc.documentKey] = doc.baseRateCount.toString();
		specialItems[doc.documentKey] = {};
		doc.specials.forEach((s) => {
			specialItems[doc.documentKey][s.dynamicRateId] = s.count.toString();
		});
		mfaCertification[doc.documentKey] = doc.mfaCertificationRateId ?? null;
		justiceCertification[doc.documentKey] = doc.justiceCertificationRateId ?? null;
		justiceInquiries[doc.documentKey] = doc.justiceInquiryRateIds ?? [];
		selfInquiry[doc.documentKey] = doc.selfInquiry ?? false;
		embassies[doc.documentKey] = doc.embassyRateIds ?? [];
		copyCount[doc.documentKey] = (doc.copyCount ?? 1).toString();
		scanRateIdByDoc[doc.documentKey] = doc.scanRateId ?? null;
		assetsByDoc[doc.documentKey] = doc.assets ?? [];
		descriptionByDoc[doc.documentKey] = doc.description ?? "";
	});

	// انتقال فایل‌های قدیمیِ سطح‌بالا به اولین مدرک (سفارش‌های پیش از جداسازی per-document)
	const firstDocKey = payload.documents[0]?.documentKey;
	if (
		firstDocKey &&
		!payload.documents.some((d) => (assetsByDoc[d.documentKey]?.length ?? 0) > 0) &&
		(payload.assets?.length ?? 0) > 0
	) {
		assetsByDoc[firstDocKey] = payload.assets ?? [];
	}

	return {
		translationItemId: payload.translationItemId,
		translationItemTitle: breakdown.translationItemTitle,
		languageId: payload.languageId,
		languageName: breakdown.languageName,
		translationItemNames,
		baseRateCount,
		specialItems,
		mfaCertification,
		justiceCertification,
		justiceInquiries,
		selfInquiry,
		embassies,
		copyCount,
		scanRateIdByDoc,
		passports: payload.passports ?? [],
		assetsByDoc,
		descriptionByDoc,
		desiredDeliveryDate: payload.desiredDeliveryDate ?? null,
		isOfficial: payload.isOfficial !== false,
	};
}
