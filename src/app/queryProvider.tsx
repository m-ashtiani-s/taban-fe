"use client";

import { useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { ResultError } from "@/types/result";
import { useNotificationStore } from "@/stores/notification.store";

function notifyOnError(error: ResultError, meta?: { showNotification?: boolean }) {
	if (!meta?.showNotification) return;
	useNotificationStore.getState().showNotification({ type: "error", message: error.description });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
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
						staleTime: 0,
						gcTime: 0,
						refetchOnWindowFocus: false,
						retry: (failureCount, error) => {
							if (failureCount >= 1) return false;
							return isRetryAble(error?.code);
						},
					},
					mutations: {
						retry: 0,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
