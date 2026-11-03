import { MetadataRoute } from "next";
import { ALLOW_INDEXING } from "@/config/global";
import { IS_SOFT_LAUNCH, absoluteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
	// در لانچ تدریجی خزش باز است تا گوگل noindexِ بقیه‌ی صفحات را ببیند؛ ایندکس با متای هر صفحه کنترل می‌شود
	if (!ALLOW_INDEXING && !IS_SOFT_LAUNCH) {
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
