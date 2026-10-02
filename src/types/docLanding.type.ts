import { FaqItem } from "./faq.type";

/**
 * draft: هنوز محتوایش کامل/تایید نشده؛ فقط وقتی سایت ایندکس‌پذیر نیست (استیجینگ/پیش از لانچ) برای
 * پیش‌نمایش تیم محتوا باز می‌شود و همیشه noindex است. published: صفحه‌ی واقعی، به شرط وجود مدرک در سامانه.
 */
export type DocLandingStatus = "draft" | "published";

/** ویجتی که باید زیر متن همان بخش رندر شود؛ این‌طوری ترتیب بلوک‌ها را محتوا تعیین می‌کند نه قالب */
export type DocLandingWidget = "price" | "sample";

export type DocLandingSection = {
	heading: string;
	level: 2 | 3;
	/** متن ساده با پاراگراف (خط خالی)، فهرست («- » یا «۱. »)، **پررنگ** و [لینک](/آدرس) */
	body: string;
	widget?: DocLandingWidget;
};

export type DocLandingSampleImage = { src: string; alt: string; width: number; height: number };

export type DocLanding = {
	slug: string;
	/**
	 * کلید پایدار مدرک در سامانه (فیلد documentType پنل ادمین). عمداً به‌جای translationItemId
	 * نگه داشته می‌شود چون آی‌دی مونگو بین محیط‌ها فرق دارد. null یعنی مدرک هنوز در سامانه تعریف نشده.
	 */
	documentType: string | null;
	publishMonth: number;
	status: DocLandingStatus;
	/** نام کوتاه مدرک برای بردکرامب و کارت‌ها */
	name: string;
	/** کلمه‌ی اصلی صفحه؛ انکرتکست همه‌ی لینک‌های داخلی به این صفحه */
	keyword: string;
	seoTitle: string;
	metaDescription: string;
	h1: string;
	intro: string;
	serviceType: string;
	sections: DocLandingSection[];
	faqs: FaqItem[];
	relatedSlugs: string[];
	sampleImage?: DocLandingSampleImage;
	/** تاریخ آخرین بازبینی محتوا (YYYY-MM-DD) برای sitemap و «تاریخ بازبینی» صفحه */
	updatedAt: string | null;
};

export type DocHub = {
	status: DocLandingStatus;
	seoTitle: string;
	metaDescription: string;
	h1: string;
	intro: string;
	updatedAt: string | null;
};
