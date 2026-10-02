"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { flushUmamiQueue, track } from "@/utils/analytics";
import { AnalyticsEvent } from "@/types/analytics.type";
import { AnalyticsProps } from "./analytics.type";

const DELEGATED_EVENTS: AnalyticsEvent[] = ["start_order", "contact_click"];

/**
 * اسکریپت‌ها afterInteractive بار می‌شوند تا روی LCP اثر نگذارند (تعریف gtag و config inline در head
 * لایوت ریشه است تا رویدادهای زودهنگام در صف بمانند). کلیک روی هر المانی که
 * data-track-event دارد (حتی در کامپوننت‌های سروری) همین‌جا به رویداد تبدیل می‌شود.
 */
export default function Analytics({ config }: AnalyticsProps) {
	const pathname = usePathname();

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track-event]");
			const event = target?.dataset.trackEvent as AnalyticsEvent | undefined;
			if (!target || !event || !DELEGATED_EVENTS.includes(event)) return;
			track(event, {
				source_page: target.dataset.trackSource || pathname,
				item_id: target.dataset.trackItem,
				channel: target.dataset.trackChannel,
			});
		};
		document.addEventListener("click", onClick, { capture: true });
		return () => document.removeEventListener("click", onClick, { capture: true });
	}, [pathname]);

	return (
		<>
			{config.gaMeasurementId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${config.gaMeasurementId}`} strategy="afterInteractive" />}
			{config.umami && (
				<Script src={config.umami.scriptUrl} data-website-id={config.umami.websiteId} strategy="afterInteractive" onLoad={flushUmamiQueue} />
			)}
		</>
	);
}
