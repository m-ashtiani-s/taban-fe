import { ResultError } from "@/types/result";

export enum InternalErrorCode {
	NETWORK_ERROR = "NETWORK_ERROR",
	TIMEOUT = "TIMEOUT",
	UNKNOWN = "UNKNOWN_ERROR",
	SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
	NOT_FOUND = "NOT_FOUND",
}

export function mapError<T = any>(err: any): ResultError {
	if (err?.response?.status === 401) {
		if (
			err?.response?.data?.fields !== "login" &&
			!err?.request?.responseURL?.includes("/profile") &&
			!err?.request?.responseURL?.includes("/cart")
		) {
			localStorage.removeItem("token");
			window.location.replace("/auth");
		}
	}
	if (!err?.response?.data?.message && err?.response?.status === 404) {
		return {
			success: false,
			description: "هیچ آدرسی متناسب با درخواست شما یافت نشد",
			code: InternalErrorCode.NOT_FOUND,
			statusCode: err?.response?.status,
		};
	}
	if (err?.code === "ECONNABORTED" || err?.response?.status === 504) {
		return {
			success: false,
			description: "مدت‌زمان پاسخ‌گویی سرور به پایان رسید. لطفاً مجدداً تلاش کنید.",
			code: InternalErrorCode.TIMEOUT,
			statusCode: err?.response?.status,
		};
	}

	if (err.message === "Network Error") {
		return {
			success: false,
			description: "امکان برقراری ارتباط با سرور وجود ندارد. اتصال اینترنت یا وضعیت سرور را بررسی کنید.",
			code: InternalErrorCode.NETWORK_ERROR,
			statusCode: err?.response?.status,
		};
	}

	if (err?.response?.status === 502 || err?.response?.status === 503) {
		return {
			success: false,
			description: "سرویس در حال حاضر در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.",
			code: InternalErrorCode.SERVICE_UNAVAILABLE,
			statusCode: err?.response?.status,
		};
	}

	if (err?.response?.data?.message) {
		const data = err.response.data;
		return {
			success: false,
			description: data.message,
			code: data.code,
			statusCode: err?.response?.status,
		};
	}

	return {
		success: false,
		description: err.message ?? "خطای غیرمنتظره‌ای رخ داده است. لطفاً بعداً تلاش کنید.",
		code: InternalErrorCode.UNKNOWN,
		statusCode: err?.response?.status,
	};
}

export function shouldRetry(code: string): boolean {
	const retryableErrors = [InternalErrorCode.UNKNOWN, InternalErrorCode.TIMEOUT, InternalErrorCode.NETWORK_ERROR, InternalErrorCode.SERVICE_UNAVAILABLE];

	return retryableErrors.includes(code as InternalErrorCode);
}
