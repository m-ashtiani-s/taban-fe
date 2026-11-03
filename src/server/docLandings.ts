import { unstable_cache } from "next/cache";
import { ALLOW_INDEXING } from "@/config/global";
import { DOC_HUB, DOC_LANDINGS } from "@/config/docLandings";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { withMappedError } from "@/utils/withMappedError";
import { DocLanding } from "@/types/docLanding.type";

export const TRANSLATION_ITEMS_CACHE_TAG = "translation-items";

type ActiveTranslationItem = { translationItemId: string; documentType: string | null; title: string; categoryName: string };

export type DocLandingItem = { translationItemId: string; title: string };

export type ResolvedDocLanding = DocLanding & {
	/** آی‌دی همان مدرک در سامانه‌ی همین محیط؛ برای پیش‌انتخاب در فلوی سفارش و قیمت زنده (فقط صفحه‌ی تک‌مدرکی) */
	translationItemId: string | null;
	/** مدارک فعالی که صفحه به آن‌ها وصل است؛ صفحه‌ی تک‌مدرکی حداکثر یکی، صفحه‌ی دسته‌ای همه‌ی مدارک آن دسته */
	items: DocLandingItem[];
	/** پیش‌نمایش پیش‌نویس (فقط وقتی سایت ایندکس‌پذیر نیست)؛ همیشه noindex */
	isPreview: boolean;
};

// فهرست مدارک فعال یک‌بار در ساعت از بک‌اند اصلی (از مسیر لایه‌ی Endpoint) خوانده و کش می‌شود تا
// فوتر، صفحه‌ی اصلی، sitemap و صفحات فرود برای هر درخواست به API نروند. وبهوک revalidate با تگ
// translation-items کش را فوراً باطل می‌کند.
const getActiveTranslationItems = unstable_cache(
	async (): Promise<ActiveTranslationItem[]> => {
		const res = await withMappedError(() => TranslationEndpoints.getTranslationItems(undefined, { timeout: 8000 }));
		return (res?.data ?? [])
			.filter((item) => item.isActive)
			.map((item) => ({
				translationItemId: item.translationItemId,
				documentType: item.documentType || null,
				title: item.title,
				categoryName: item.categoryName ?? "",
			}));
	},
	["active-translation-items"],
	{ revalidate: 3600, tags: [TRANSLATION_ITEMS_CACHE_TAG] }
);

/** null یعنی سامانه در دسترس نبود؛ در این حالت فرض بر وجود مدرک است تا یک قطعی موقت صفحات را ۴۰۴ نکند */
async function loadActiveItems(): Promise<ActiveTranslationItem[] | null> {
	try {
		return await getActiveTranslationItems();
	} catch {
		return null;
	}
}

/** متن فارسی ورودی ممکن است انکدشده یا با «ي/ك» عربی و نیم‌فاصله‌ی متفاوت برسد؛ قبل از مقایسه یکدست می‌شود */
function normalizeFa(raw: string): string {
	let value = raw;
	try {
		value = decodeURIComponent(raw);
	} catch {}
	return value.normalize("NFC").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeDocSlug(raw: string): string {
	let slug = raw;
	try {
		slug = decodeURIComponent(raw);
	} catch {}
	return slug.normalize("NFC").replace(/ي/g, "ی").replace(/ك/g, "ک").trim();
}

function isLinkable(landing: DocLanding): boolean {
	return !!landing.documentType || !!landing.categoryTitle;
}

/** مدارک سامانه‌ای که صفحه به آن‌ها وصل است؛ با سامانه‌ی در دسترس نبودن، آرایه‌ی خالی */
function findItems(landing: DocLanding, active: ActiveTranslationItem[] | null): DocLandingItem[] {
	if (!active) return [];
	if (landing.documentType) {
		const item = active.find((candidate) => candidate.documentType === landing.documentType);
		return item ? [{ translationItemId: item.translationItemId, title: item.title }] : [];
	}
	if (landing.categoryTitle) {
		const category = normalizeFa(landing.categoryTitle);
		return active
			.filter((candidate) => normalizeFa(candidate.categoryName) === category)
			.map((candidate) => ({ translationItemId: candidate.translationItemId, title: candidate.title }));
	}
	return [];
}

function toResolved(landing: DocLanding, items: DocLandingItem[], isPreview: boolean): ResolvedDocLanding {
	return {
		...landing,
		translationItemId: landing.documentType ? items[0]?.translationItemId ?? null : null,
		items,
		isPreview,
	};
}

/** اسلاگ‌هایی که در بیلد ساخته می‌شوند؛ شرط وجود مدرک هنگام رندر بررسی می‌شود */
export function getBuildableDocSlugs(): string[] {
	return DOC_LANDINGS.filter((landing) => landing.status === "published" || !ALLOW_INDEXING).map((landing) => landing.slug);
}

/** صفحه‌ی قابل رندر یا null (= ۴۰۴): پیش‌نویس فقط در حالت بسته؛ منتشرشده فقط اگر مدرک (یا دسته‌اش) در سامانه فعال باشد */
export async function resolveDocLanding(rawSlug: string): Promise<ResolvedDocLanding | null> {
	const slug = normalizeDocSlug(rawSlug);
	const landing = DOC_LANDINGS.find((item) => item.slug === slug);
	if (!landing) return null;

	const active = await loadActiveItems();
	const items = findItems(landing, active);

	if (landing.status === "draft") {
		if (ALLOW_INDEXING) return null;
		return toResolved(landing, items, true);
	}

	if (!isLinkable(landing)) return null;
	if (active && !items.length) return null;
	return toResolved(landing, items, false);
}

/** صفحات منتشرشده‌ای که واقعاً در دسترس‌اند؛ منبع لینک‌های فوتر، صفحه‌ی اصلی، مرتبط‌ها و sitemap */
export async function getLiveDocLandings(): Promise<DocLanding[]> {
	const published = DOC_LANDINGS.filter((landing) => landing.status === "published" && isLinkable(landing));
	if (!published.length) return [];
	const active = await loadActiveItems();
	if (!active) return published;
	return published.filter((landing) => findItems(landing, active).length > 0);
}

export function isDocHubRenderable(): boolean {
	return DOC_HUB.status === "published" || !ALLOW_INDEXING;
}
