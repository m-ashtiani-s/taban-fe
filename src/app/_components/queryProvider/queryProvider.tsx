"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { useNotificationStore } from "@/stores/notification.store";
import { GC_TIME, STALE_TIME } from "@/core/query/staleTime";
import { ResultError } from "@/types/result";
import { QueryProviderProps } from "./queryProvider.type";

const ReactQueryDevtools = dynamic(
	() => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
	{ ssr: false }
);

function notifyOnError(error: ResultError, meta?: { showNotification?: boolean }) {
	if (!meta?.showNotification) return;
	useNotificationStore.getState().showNotification({ type: "error", message: error.description });
}

export default function QueryProvider({ children }: QueryProviderProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache: new QueryCache({
					onError: (error, query) => notifyOnError(error, query.meta),
				}),
				mutationCache: new MutationCache({
					onError: (error, _variables, _context, mutation) => notifyOnError(error, mutation.meta),
				}),
				defaultOptions: {
					queries: {
						staleTime: STALE_TIME.DEFAULT,
						gcTime: GC_TIME.DEFAULT,
						refetchOnWindowFocus: false,
						refetchOnReconnect: true,
						// react-query به‌صورت پیش‌فرض وقتی navigator.onLine آفلاین باشد درخواست را
						// بی‌صدا pause می‌کند و کوئری در pending می‌ماند. چون navigator.onLine در
						// وب‌ویو و مرورگرهای درون‌برنامه‌ای قابل‌اعتماد نیست و mapError خودش خطای
						// شبکه را با پیام فارسی برمی‌گرداند، ترجیح می‌دهیم درخواست ارسال شود و
						// شکست بخورد تا اینکه معلق بماند.
						networkMode: "always",
						retry: (failureCount, error) => {
							if (failureCount >= 1) return false;
							return isRetryAble(error?.code);
						},
					},
					mutations: {
						networkMode: "always",
						retry: 0,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
		</QueryClientProvider>
	);
}
