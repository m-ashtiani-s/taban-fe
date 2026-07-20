import { ResultError } from "./result";

declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ResultError;
		queryMeta: QueryMeta;
		mutationMeta: QueryMeta;
	}
}

/** متادیتای دلخواهی که به کوئری/میوتیشن پاس می‌دهیم تا هندلرهای سراسری بتوانند رفتارشان را تغییر دهند */
type QueryMeta = {
	/** اگر true باشد، خطای این درخواست به صورت توست به کاربر نمایش داده می‌شود */
	showNotification?: boolean;
};
