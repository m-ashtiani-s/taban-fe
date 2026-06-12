export type RateCalculationDocumentInput = {
	documentKey: string;
	title: string;
	baseRateCount: number;
	specials: { dynamicRateId: string; count: number }[];
	mfaCertificationRateId?: string | null;
	justiceCertificationRateId?: string | null;
	justiceInquiryRateIds: string[];
	embassyRateIds?: string[];
};

export type RateCalculationRequest = {
	translationItemId: string;
	languageId: string;
	documents: RateCalculationDocumentInput[];
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

export type RateCalculationDocumentBreakdown = {
	documentKey: string;
	title: string;
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
	documentTotal: number;
};

export type RateCalculationSummary = {
	translationPrice: number;
	certificationPrice: number;
	inquiryPrice: number;
	/** مجموع نرخ تایید سفارت. در breakdownهای قدیمیِ ذخیره‌شده ممکن است موجود نباشد. */
	embassyPrice?: number;
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
