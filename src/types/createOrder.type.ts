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
	embassyItems?: {
		translationItemTitle: string;
		translationItemId: string;
		embassies: EmbassySelection[];
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
	/** فایل‌های آپلودشده به تفکیک هر مدرک (کلید: documentKey همان مدرک) */
	assetsByDoc?: Record<string, string[]>;
	/** ریشه‌ی پوشه‌ی آپلود برای کاربر مهمان (تا همه‌ی فایل‌های یک سفارش زیر یک پوشه بمانند) */
	uploadScope?: string;
	copyCount?: Record<string, string>;
	/** شناسه‌ی نرخ اسکن انتخاب‌شده برای هر مدرک (کلید: documentKey، مقدار: scanRateId یا null) */
	scanRateIdByDoc?: Record<string, string | null>;
	/** مدارکی که کاربر استعلام‌هایشان را خودش تهیه می‌کند (کلید: documentKey همان مدرک) */
	selfInquiryByDoc?: Record<string, boolean>;
	/** توضیحاتِ نوشته‌شده توسط کاربر برای هر مدرک (کلید: documentKey همان مدرک) */
	descriptionByDoc?: Record<string, string>;
	/** تاریخ تحویل دلخواهِ کاربر برای کل این آیتم (اختیاری) */
	desiredDeliveryDate?: string | null;
	// در صورت ثبت سفارش توسط مشتری سازمانی برای یک مشتری زیرمجموعه، آی‌دی آن مشتری اینجا نگه داشته می‌شود
	customerId?: string | null;
	/** ترجمه رسمی است یا غیررسمی. پیش‌فرض: true (رسمی) */
	isOfficial?: boolean;
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

export type EmbassySelection = {
	embassyRateId: string;
};
