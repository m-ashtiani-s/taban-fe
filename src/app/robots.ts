import { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				// مسیرهای خصوصی/اپلیکیشنی که نباید ایندکس شوند
				disallow: ["/api/", "/profile", "/cart", "/enterprise-customers", "/auth"],
			},
		],
		sitemap: `${SITE_BASE_URL}/sitemap.xml`,
		host: SITE_BASE_URL,
	};
}
