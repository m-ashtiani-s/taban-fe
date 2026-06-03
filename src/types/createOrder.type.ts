import { Language } from "@/types/language.type";
import { TranslationItem } from "@/types/translationItem.type";

export type CreateOrder = {
	translationItem?: TranslationItem | null;
	translationItemCount?: number;
	language?: Language | null;
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
		justiceInquiries: JusticeInquirySelection[];
	}[];
	mfaCertification?: {
		translationItemTitle: string;
		translationItemId: string;
		mfaCertification: CertificationSelection | null;
	}[];
	justiceCertification?: {
		translationItemTitle: string;
		translationItemId: string;
		justiceCertification: CertificationSelection | null;
	}[];
	passports?: string[];
	assets?: string[];
	copyCount?: Record<string, number>;
	// در صورت ثبت سفارش توسط مشتری سازمانی برای یک مشتری زیرمجموعه، آی‌دی آن مشتری اینجا نگه داشته می‌شود
	customerId?: string | null;
};

export type SpecialItemsValue = {
	dynamicRateId: string;
	count: number;
};

export type CertificationSelection = {
	certificationRateId: string;
};

export type JusticeInquirySelection = {
	justiceInquiryRateId: string;
};
