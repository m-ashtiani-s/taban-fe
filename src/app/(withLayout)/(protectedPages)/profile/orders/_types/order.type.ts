import { RateCalculationResponse } from "@/types/rateCalculation.type";
import { AddDocumentToCartPayload } from "@/types/cart.type";

export type OrderStatus =
	| "document_submission"
	| "approved"
	| "paid"
	| "admin_registration"
	| "translating"
	| "documents_received"
	| "reviewing"
	| "certifications"
	| "ready_for_delivery"
	| "translation_scan"
	| "documents_sent"
	| "delivered"
	| "needs_editing";

export type PaymentStatus = "pending" | "paid" | "failed";

export type OrderedDoc = {
	cartItemId: string;
	translationItemId: string;
	translationItemTitle: string;
	languageId: string;
	languageName: string;
	payload: AddDocumentToCartPayload;
	breakdown: RateCalculationResponse;
	itemTotal: number;
};

export type OrderShippingAddressInfo = {
	shippingAddressId: string;
	title: string;
	provinceName: string;
	cityName: string;
	fullAddress: string;
	plaque: string | null;
	unit: string | null;
	landlineNumber: string | null;
	addressDescription: string | null;
};

export type OrderCouponInfo = { couponId: string; code: string };

export type OrderCustomerInfo = {
	customerId: string;
	fullName: string;
	nationalId: string;
	phoneNumber: string;
	provinceName: string;
	cityName: string;
};

export type Order = {
	orderId: string;
	orderNumber: number;
	user: string | null;
	customer: OrderCustomerInfo | string | null;
	orderedDocs: OrderedDoc[];
	coupon: OrderCouponInfo | string | null;
	discountAmount: number;
	totalAmount: number;
	shippingAddress: OrderShippingAddressInfo | string | null;
	status: OrderStatus;
	rejectedRemarks: string | null;
	paymentStatus: PaymentStatus;
	finalAmount: number;
	remarks: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateOrderPayload = {
	shippingAddressId: string;
	remarks?: string;
};

export type OrderFilters = {
	status?: OrderStatus;
	customerId?: string;
	withCustomer?: boolean;
};
