export type AnalyticsEvent = "start_order" | "order_step_view" | "add_to_cart" | "begin_checkout" | "purchase" | "contact_click" | "sign_up";

export type AnalyticsItem = { item_id: string; item_name?: string };

/** هرگز نام، موبایل، کد ملی یا شماره گذرنامه در این پارامترها نمی‌رود */
export type AnalyticsParams = {
	source_page?: string;
	item_id?: string;
	language_id?: string;
	step?: string;
	channel?: string;
	transaction_id?: string;
	value?: number;
	currency?: "IRR";
	items?: AnalyticsItem[];
};

export type AnalyticsConfig = {
	gaMeasurementId?: string;
	umami?: { scriptUrl: string; websiteId: string };
};
