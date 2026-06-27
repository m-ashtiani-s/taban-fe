export type RateCalculationDocumentInput = {
	documentKey: string;
	title: string;
	baseRateCount: number;
	copyCount?: number;
	specials: { dynamicRateId: string; count: number }[];
	mfaCertificationRateId?: string | null;
	justiceCertificationRateId?: string | null;
	justiceInquiryRateIds: string[];
	embassyRateIds?: string[];
	/** شناسه‌ی نرخ اسکن در صورت انتخاب اسکن برای این مدرک */
	scanRateId?: string | null;
	/** فایل‌های آپلودشده‌ی این مدرک. در payloadهای قدیمی ممکن است موجود نباشد. */
	assets?: string[];
	/** فایل‌های اسکن‌شده‌ی این مدرک که توسط ادمین آپلود می‌شوند. */
	scanAssets?: string[];
	/** کاربر استعلام‌های این مدرک را خودش تهیه می‌کند (استعلام پولیِ ما انتخاب نمی‌شود). */
	selfInquiry?: boolean;
	/** توضیحاتِ نوشته‌شده توسط کاربر برای این مدرک (در فلوهای ثبت/ویرایش سفارش). */
	description?: string;
};

export type RateCalculationRequest = {
	translationItemId: string;
	languageId: string;
	documents: RateCalculationDocumentInput[];
	/** ترجمه رسمی است یا خیر. false → سنام و مهر مترجم از نرخ پایه حذف می‌شوند. پیش‌فرض: true */
	isOfficial?: boolean;
};

export type RateCalculationSpecialLine = {
	dynamicRateId: string;
	label: string;
	unitPrice: number;
	count: number;
	total: number;
};

export type RateCalculationCertificationLine = {
	certificationRateId: string;
	price: number;
};

export type RateCalculationInquiryLine = {
	justiceInquiryRateId: string;
	justiceInquiryName: string;
	price: number;
};

export type RateCalculationEmbassyLine = {
	embassyRateId: string;
	embassyName: string;
	price: number;
};

export type RateCalculationScanLine = {
	scanRateId: string;
	price: number;
};

export type RateCalculationDocumentBreakdown = {
	documentKey: string;
	title: string;
	/** تعداد نسخه‌ی این مدرک. در breakdownهای قدیمی ممکن است موجود نباشد (پیش‌فرض ۱). */
	copyCount?: number;
	base: {
		baseRateId: string;
		title: string;
		unitPrice: number;
		count: number;
		total: number;
	};
	specials: RateCalculationSpecialLine[];
	specialsTotal: number;
	/** مجموع هزینه‌ی ترجمه (نرخ پایه + ویژگی‌های داینامیک). از سمت سرور در لایه‌ی ترنسفورم سبد محاسبه می‌شود. */
	translationTotal?: number;
	mfaCertification: RateCalculationCertificationLine | null;
	justiceCertification: RateCalculationCertificationLine | null;
	certificationsTotal: number;
	justiceInquiries: RateCalculationInquiryLine[];
	inquiriesTotal: number;
	/** تاییدات سفارت انتخاب‌شده برای این سند. در breakdownهای قدیمیِ ذخیره‌شده ممکن است موجود نباشد. */
	embassyApprovals?: RateCalculationEmbassyLine[];
	embassyTotal?: number;
	/** اطلاعات اسکن در صورت انتخاب برای این مدرک. در breakdownهای قدیمی موجود نیست. */
	scan?: RateCalculationScanLine | null;
	documentTotal: number;
};

export type RateCalculationSummary = {
	translationPrice: number;
	certificationPrice: number;
	inquiryPrice: number;
	/** مجموع نرخ تایید سفارت. در breakdownهای قدیمیِ ذخیره‌شده ممکن است موجود نباشد. */
	embassyPrice?: number;
	/** مجموع هزینه‌ی اسکن. در breakdownهای قدیمیِ ذخیره‌شده ممکن است موجود نباشد. */
	scanPrice?: number;
	/** درصد تخفیف باشگاه مشتریان روی مبلغ ترجمه. در breakdownهای قدیمی ممکن است موجود نباشد. */
	tierDiscountPercent?: number;
	/** مبلغ تخفیف باشگاه مشتریان (روی مبلغ ترجمه). در breakdownهای قدیمی ممکن است موجود نباشد. */
	tierDiscountAmount?: number;
	subtotal: number;
	taxPercent: number;
	taxPrice: number;
	totalPrice: number;
};

export type RateCalculationResponse = {
	translationItemId: string;
	translationItemTitle: string;
	languageId: string;
	languageName: string;
	documents: RateCalculationDocumentBreakdown[];
	summary: RateCalculationSummary;
};
