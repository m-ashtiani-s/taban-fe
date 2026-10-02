import { MetadataRoute } from "next";
import { ALLOW_INDEXING } from "@/config/global";
import { absoluteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
	if (!ALLOW_INDEXING) {
		return { rules: [{ userAgent: "*", disallow: "/" }] };
	}

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				// /new-order/ با اسلش: مراحل سفارش بسته می‌ماند ولی خود /new-order باز است.
				// /_next/، فونت‌ها و تصاویر عمداً بسته نمی‌شوند چون گوگل برای رندر صفحه لازمشان دارد.
				disallow: ["/api/", "/wp-json/", "/auth", "/profile", "/cart", "/enterprise-customers", "/payment", "/new-order/"],
			},
		],
		sitemap: absoluteUrl("/sitemap.xml"),
	};
}
