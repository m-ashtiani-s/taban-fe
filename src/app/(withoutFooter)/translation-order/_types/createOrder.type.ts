import { Language } from "@/types/language.type";
import { TranslationItem } from "@/types/translationItem.type";
import { CertificationRate } from "./certificationRate.type";
import { JusticeInquiryRate } from "./justiceInquiry.type";

export type CreateOrder = {
	translationItem?: TranslationItem | null;
	language?: Language | null;
	specialItems?: SpecialItemsValue[];
	justiceInquiriesItems?: JusticeInquiryRate[];
	mfaCertification?: CertificationItem | null;
	justiceCertification?: CertificationItem | null;
};

export type SpecialItemsValue = {
	dynamicRateId: string;
	count: number;
	label: string;
	price: number | string;
};

export type CertificationItem = {
	price: number | string;
};
