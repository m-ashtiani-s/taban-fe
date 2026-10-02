import { Metadata } from "next";
import { SITE_URL } from "./global";
import { FaqItem } from "@/types/faq.type";

/**
 * ثابت‌های مرکزی هویت سایت برای استفاده در متادیتا، sitemap، robots و structured data.
 * منبع واحد تا عنوان/برند در همه‌جا یکدست بماند.
 */
export const SITE_NAME = "رسمی‌یاب";
export const SITE_TITLE = "دارالترجمه رسمی آنلاین رسمی‌یاب | ترجمه رسمی مدارک با قیمت شفاف";
export const SITE_DESCRIPTION =
	"ترجمه رسمی مدارک با مهر مترجم رسمی دادگستری؛ ثبت سفارش آنلاین، محاسبه‌ی لحظه‌ای هزینه، تاییدات دادگستری و امور خارجه و ارسال به سراسر کشور.";
export const SITE_LOCALE = "fa_IR";

/** آدرس پایه‌ی سایت (با fallback تا در نبود env هم build/runtime نشکند) */
export const SITE_BASE_URL = (SITE_URL || "https://rasmiyab.com").replace(/\/$/, "");

export const ORGANIZATION_ID = `${SITE_BASE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_BASE_URL}/#website`;

/** لوگوی مربعی PNG؛ گوگل لوگوی SVG را برای Organization نمی‌پذیرد */
export const SITE_LOGO = { path: "/images/logo-512.png", width: 512, height: 512 };

/**
 * اطلاعات تماس از یک نقطه خوانده می‌شود (صفحه‌ی تماس، فوتر و اسکیما)؛
 * نام، آدرس و تلفن باید حرف‌به‌حرف با Google Business Profile یکی باشند.
 */
export const SITE_CONTACT = {
	phone: { display: "021-26755421", e164: "+982126755421" },
	whatsapp: { display: "09032009914", e164: "+989032009914" },
	email: "info@rasmiyab.com",
	address: {
		full: "تهران، محله دروس، خیابان شهید یوسف کلاهدوز، پلاک ۱۲۶، طبقه ۳، واحد ۱۵",
		street: "محله دروس، خیابان شهید یوسف کلاهدوز، پلاک ۱۲۶، طبقه ۳، واحد ۱۵",
		locality: "تهران",
		region: "تهران",
		country: "IR",
	},
};

export const telHref = (e164: string) => `tel:${e164}`;
export const whatsappHref = (e164: string) => `https://wa.me/${e164.replace(/^\+/, "")}`;

export type OpeningHours = { label: string; days: string[]; opens: string; closes: string; display: string };

/** ساعات کاری حضوری/تلفنی؛ هم جدول صفحه‌ی تماس و هم openingHoursSpecification از همین ساخته می‌شوند */
export const OPENING_HOURS: OpeningHours[] = [
	{
		label: "شنبه تا چهارشنبه",
		days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
		opens: "09:00",
		closes: "18:00",
		display: "۹:۰۰ تا ۱۸:۰۰",
	},
	{ label: "پنجشنبه", days: ["Thursday"], opens: "09:00", closes: "13:00", display: "۹:۰۰ تا ۱۳:۰۰" },
];

export type SocialProfile = { network: "instagram" | "telegram" | "whatsapp" | "linkedin"; url: string; label: string };

/**
 * پروفایل‌های رسمی شبکه‌های اجتماعی. تا وقتی پیج واقعی نداریم خالی می‌ماند؛ آیکون‌های فوتر و
 * صفحه‌ی تماس و فیلد sameAs اسکیما همه از همین آرایه ساخته می‌شوند و با خالی بودنش مخفی‌اند.
 */
export const SOCIAL_PROFILES: SocialProfile[] = [];

/** آدرس مطلق با همان انکدینگی که Next برای canonical می‌سازد (مهم برای اسلاگ‌های فارسی) */
export function absoluteUrl(path: string): string {
	return new URL(path, `${SITE_BASE_URL}/`).toString();
}

export type PageMetadataInput = {
	title: string;
	/** وقتی تایتل خودش نام برند را دارد، template لایوت ریشه دوباره اضافه‌اش نکند */
	absoluteTitle?: boolean;
	description: string;
	path: string;
	ogType?: "website" | "article";
	images?: string[];
	robots?: Metadata["robots"];
	article?: { publishedTime?: string; modifiedTime?: string; authors?: string[] };
};

/**
 * متادیتای استاندارد هر صفحه‌ی قابل ایندکس. در Next شیء openGraph صفحه کل شیء ریشه را جایگزین
 * می‌کند، پس siteName و locale و url همین‌جا برای همه‌ی صفحات تکرار می‌شوند.
 */
export function buildMetadata({ title, absoluteTitle, description, path, ogType = "website", images, robots, article }: PageMetadataInput): Metadata {
	const url = absoluteUrl(path);
	const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
	return {
		title: absoluteTitle ? { absolute: title } : title,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: ogType,
			siteName: SITE_NAME,
			locale: SITE_LOCALE,
			url,
			title: fullTitle,
			description,
			...(images?.length ? { images } : {}),
			...(ogType === "article" && article ? article : {}),
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
			...(images?.length ? { images } : {}),
		},
		...(robots ? { robots } : {}),
	};
}

/** هویت برند در یک @graph؛ بقیه‌ی اسکیماها فقط با @id به این دو نود ارجاع می‌دهند */
export function buildSiteGraph() {
	const sameAs = SOCIAL_PROFILES.map((p) => p.url);
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": ORGANIZATION_ID,
				name: SITE_NAME,
				alternateName: ["رسمی یاب", "Rasmiyab"],
				url: absoluteUrl("/"),
				logo: {
					"@type": "ImageObject",
					url: absoluteUrl(SITE_LOGO.path),
					width: SITE_LOGO.width,
					height: SITE_LOGO.height,
				},
				email: SITE_CONTACT.email,
				telephone: SITE_CONTACT.phone.e164,
				address: buildPostalAddress(),
				contactPoint: {
					"@type": "ContactPoint",
					contactType: "customer service",
					telephone: SITE_CONTACT.phone.e164,
					email: SITE_CONTACT.email,
					areaServed: "IR",
					availableLanguage: ["fa"],
				},
				...(sameAs.length ? { sameAs } : {}),
			},
			{
				"@type": "WebSite",
				"@id": WEBSITE_ID,
				name: SITE_NAME,
				url: absoluteUrl("/"),
				inLanguage: "fa-IR",
				publisher: { "@id": ORGANIZATION_ID },
			},
		],
	};
}

export function buildPostalAddress() {
	return {
		"@type": "PostalAddress",
		streetAddress: SITE_CONTACT.address.street,
		addressLocality: SITE_CONTACT.address.locality,
		addressRegion: SITE_CONTACT.address.region,
		addressCountry: SITE_CONTACT.address.country,
	};
}

export type BreadcrumbItem = { name: string; path: string };

export function buildBreadcrumbList(items: BreadcrumbItem[]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		})),
	};
}

export function buildFaqPage(items: FaqItem[]) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: items.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: { "@type": "Answer", text: item.answer },
		})),
	};
}
