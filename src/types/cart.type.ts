import {
	RateCalculationDocumentInput,
	RateCalculationResponse,
} from "@/types/rateCalculation.type";

export type AddDocumentToCartPayload = {
	translationItemId: string;
	languageId: string;
	documents: RateCalculationDocumentInput[];
	passports?: string[];
	assets?: string[];
	customerId?: string | null;
};

export type CartItem = {
	cartItemId: string;
	payload: AddDocumentToCartPayload;
	breakdown: RateCalculationResponse;
};

export type AppliedCouponDocumentDiscount = {
	documentKey: string;
	discountAmount: number;
};

export type AppliedCouponItemDiscount = {
	cartItemId: string;
	translationItemId: string;
	itemDiscountTotal: number;
	documents: AppliedCouponDocumentDiscount[];
};

export type AppliedCoupon = {
	couponId: string;
	code: string;
	discountType: "percent" | "fixed";
	discountValue: number;
	appliesTo: "base" | "total";
	applicableSubtotal: number;
	discountAmount: number;
	itemDiscounts: AppliedCouponItemDiscount[];
};

export type Cart = {
	cartId: string;
	items: CartItem[];
	cartSum: number;
	cartSumWithDiscount: number;
	appliedCoupon: AppliedCoupon | null;
};
