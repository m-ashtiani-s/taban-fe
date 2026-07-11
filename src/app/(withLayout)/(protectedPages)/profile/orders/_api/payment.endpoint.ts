import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";

export type InitiatePaymentResult = {
	paymentId: string;
	authority: string;
	redirectUrl: string;
};

export const PaymentEndpoints = {
	// شروع پرداخت یک سفارش تاییدشده و دریافت آدرس هدایت به درگاه.
	// backUrl: آدرس صفحه‌ای در همین فرانت که کاربر بعد از پایان پرداخت به آن برمی‌گردد.
	initiate: async (orderId: string, backUrl?: string) => {
		const res = await httpClient.call<Res<InitiatePaymentResult>>({
			method: "POST",
			url: `v1/user/payments`,
			data: { orderId, backUrl },
		});
		return res?.data;
	},
};
