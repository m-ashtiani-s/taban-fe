import { unstable_cache } from "next/cache";
import { ALLOW_INDEXING } from "@/config/global";
import { DOC_HUB, DOC_LANDINGS } from "@/config/docLandings";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { withMappedError } from "@/utils/withMappedError";
import { DocLanding } from "@/types/docLanding.type";

export const TRANSLATION_ITEMS_CACHE_TAG = "translation-items";

type ActiveTranslationItem = { translationItemId: string; documentType: string };

export type ResolvedDocLanding = DocLanding & {
	/** آی‌دی همان مدرک در سامانه‌ی همین محیط؛ برای پیش‌انتخاب در فلوی سفارش و قیمت زنده */
	translationItemId: string | null;
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
			.filter((item) => item.isActive && !!item.documentType)
			.map((item) => ({ translationItemId: item.translationItemId, documentType: item.documentType }));
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

/** اسلاگ ورودی ممکن است انکدشده یا با «ي/ك» عربی برسد؛ قبل از جست‌وجو در رجیستری یکدست می‌شود */
function normalizeDocSlug(raw: string): string {
	let slug = raw;
	try {
		slug = decodeURIComponent(raw);
	} catch {}
	return slug.normalize("NFC").replace(/ي/g, "ی").replace(/ك/g, "ک").trim();
}

function findItem(landing: DocLanding, active: ActiveTranslationItem[] | null) {
	if (!landing.documentType || !active) return null;
	return active.find((item) => item.documentType === landing.documentType) ?? null;
}

/** اسلاگ‌هایی که در بیلد ساخته می‌شوند؛ شرط وجود مدرک هنگام رندر بررسی می‌شود */
export function getBuildableDocSlugs(): string[] {
	return DOC_LANDINGS.filter((landing) => landing.status === "published" || !ALLOW_INDEXING).map((landing) => landing.slug);
}

/** صفحه‌ی قابل رندر یا null (= ۴۰۴): پیش‌نویس فقط در حالت بسته؛ منتشرشده فقط اگر مدرکش در سامانه فعال باشد */
export async function resolveDocLanding(rawSlug: string): Promise<ResolvedDocLanding | null> {
	const slug = normalizeDocSlug(rawSlug);
	const landing = DOC_LANDINGS.find((item) => item.slug === slug);
	if (!landing) return null;

	const active = await loadActiveItems();
	const item = findItem(landing, active);

	if (landing.status === "draft") {
		if (ALLOW_INDEXING) return null;
		return { ...landing, translationItemId: item?.translationItemId ?? null, isPreview: true };
	}

	if (!landing.documentType) return null;
	if (active && !item) return null;
	return { ...landing, translationItemId: item?.translationItemId ?? null, isPreview: false };
}

/** صفحات منتشرشده‌ای که واقعاً در دسترس‌اند؛ منبع لینک‌های فوتر، صفحه‌ی اصلی، مرتبط‌ها و sitemap */
export async function getLiveDocLandings(): Promise<DocLanding[]> {
	const published = DOC_LANDINGS.filter((landing) => landing.status === "published" && !!landing.documentType);
	if (!published.length) return [];
	const active = await loadActiveItems();
	if (!active) return published;
	return published.filter((landing) => !!findItem(landing, active));
}

export function isDocHubRenderable(): boolean {
	return DOC_HUB.status === "published" || !ALLOW_INDEXING;
}
