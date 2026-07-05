import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	// نوایندکسِ سراسری: خزش کل سایت برای همه‌ی ربات‌ها غیرمجاز است
	return {
		rules: [
			{
				userAgent: "*",
				disallow: "/",
			},
		],
	};
}
