export {};

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
		umami?: { track: (event: string, data?: Record<string, unknown>) => void };
	}
}
