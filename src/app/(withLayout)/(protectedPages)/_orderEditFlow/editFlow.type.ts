import { Dispatch, SetStateAction } from "react";
import { AddDocumentToCartPayload } from "@/types/cart.type";
import { RateCalculationRequest, RateCalculationResponse } from "@/types/rateCalculation.type";
import { StepKey } from "@/app/(withoutFooter)/new-order/_config/steps";
import { OrderRates } from "@/app/(withoutFooter)/new-order/_hooks/useOrderRates";

/** منبع اولیه‌ی ویرایش؛ هم آیتم سبد خرید و هم آیتمِ سفارش این شکل مشترک را دارند */
export type EditSource = { payload: AddDocumentToCartPayload; breakdown: RateCalculationResponse };

/** خلاصه‌ی مرحله‌ی پرداخت؛ کامل برای سبد خرید، جمع‌وجور برای آیتمِ سفارش */
export type EditSummaryVariant = "full" | "compact";

export type EditState = {
	translationItemId: string;
	translationItemTitle: string;
	languageId: string;
	languageName: string;
	translationItemNames: Record<string, string>;
	baseRateCount: Record<string, string>;
	specialItems: Record<string, Record<string, string>>;
	mfaCertification: Record<string, string | null>;
	justiceCertification: Record<string, string | null>;
	justiceInquiries: Record<string, string[]>;
	selfInquiry: Record<string, boolean>;
	embassies: Record<string, string[]>;
	copyCount: Record<string, string>;
	scanRateIdByDoc: Record<string, string | null>;
	passports: string[];
	assetsByDoc: Record<string, string[]>;
	descriptionByDoc: Record<string, string>;
	desiredDeliveryDate: string | null;
	isOfficial: boolean;
};

/** تنظیماتِ متفاوتِ هر فلو (سبد خرید در برابر آیتمِ سفارش) */
export type EditFlowConfig = {
	headerTitle: string;
	cancelHref: string;
	submitLabel: string;
	summaryVariant: EditSummaryVariant;
	// ریشه‌ی URL مراحل، مثلا `/cart/${cartItemId}` — سگمنتِ مرحله به آن اضافه می‌شود
	stepBase: string;
};

/**
 * مقادیر مشترکی که لایوتِ ویرایش (EditFlowLayout) می‌سازد و کامپوننتِ مرحله
 * (EditStepContent) مصرف می‌کند. چون لایوت بین ناوبریِ مراحل remount نمی‌شود،
 * این مقادیر بین همه‌ی مراحل پایدار می‌مانند.
 */
export type EditFlowContextValue = {
	editState: EditState;
	setEditState: Dispatch<SetStateAction<EditState | null>>;
	rates: OrderRates;
	currentStep: StepKey;
	summaryVariant: EditSummaryVariant;
	uploadScope: string;
	uploadDescription: string;
	namePlaceholder?: string;
	wantEmbassyByDoc: Record<string, boolean>;
	toggleWantEmbassy: (docKey: string) => void;
	onSelectLanguage: (languageId: string, languageName: string) => void;
	calcPayload: RateCalculationRequest | null;
};
