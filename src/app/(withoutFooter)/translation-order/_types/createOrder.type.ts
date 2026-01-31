import { Language } from "@/types/language.type";
import { TranslationItem } from "@/types/translationItem.type";
import { JusticeInquiryRate } from "./justiceInquiry.type";

export type CreateOrder = {
	translationItem?: TranslationItem | null;
	translationItemCount?: number;
	language?: Language | null;
	baseRate?: string | number | null;
	baseRateCount?: Record<string, string>;
	translationItemNames?: Record<string, string>;
	specialItems?: {
		translationItemTitle: string;
		translationItemId: string;
		specials: SpecialItemsValue[];
	}[];
	justiceInquiriesItems?: {
		translationItemTitle: string;
		translationItemId: string;
		justiceInquiries: JusticeInquiryRate[];
	}[];

	mfaCertification?: {
		translationItemTitle: string;
		translationItemId: string;
		mfaCertification: CertificationItem | null;
	}[];
	justiceCertification?: {
		translationItemTitle: string;
		translationItemId: string;

		justiceCertification: CertificationItem | null;
	}[];
	passports?: string[];
	assets?: string[];
	copyCount?: Record<string, number>;
};

export type SpecialItemsValue = {
	dynamicRateId: string;
	count: number;
	label: string;
	price: number | string;
};

export type CertificationItem = {
	price: number | string;
	certificationRateId: string
};
