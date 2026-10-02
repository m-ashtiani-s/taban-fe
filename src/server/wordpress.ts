import { WP_URL } from "@/config/global";
import { SITE_BASE_URL } from "@/config/site";
import { BlogPostDtoApi } from "@/app/api/_dtos/blogPostDto.type";
import { TopBannerHomeDtoApi } from "@/app/api/_dtos/topBannerDto.type";
import { BlogPostDto } from "@/types/blogPost.type";
import { BlogPostDetailDto } from "@/types/blogPostDetail.type";
import { Paginate } from "@/types/paginate";
import { TopBanner } from "@/types/topBanner.type";
import { convertToJalali } from "@/utils/dateConverts";
import { stripHtml } from "@/utils/stripHtml";

/**
 * تنها نقطه‌ی دریافت داده از وردپرس سمت سرور. وردپرس منبعی عمومی و بدون احراز هویت است و
 * طبق «استثناهای مجاز» قانون معماری فچ، مستقیم با fetch و کش native خود Next خوانده می‌شود.
 * هم route handlerها و هم صفحات سروری همین توابع را صدا می‌زنند (بدون رفت‌وبرگشت HTTP به خود سایت).
 */
export const POSTS_CACHE_TAG = "posts";
export const HOME_CACHE_TAG = "wp-home";
const REVALIDATE_SECONDS = 600;

class WordPressUnavailableError extends Error {}

const wpHost = (() => {
	try {
		return WP_URL ? new URL(WP_URL).host : null;
	} catch {
		return null;
	}
})();

async function wpFetch(path: string, tags: string[]): Promise<Response> {
	if (!WP_URL) throw new WordPressUnavailableError("NEXT_PUBLIC_WP_URL تنظیم نشده است");
	try {
		// سقف زمانی تا کندی وردپرس رندر صفحه‌ها (و لایوت ریشه که بنر را می‌گیرد) را معطل نکند
		return await fetch(`${WP_URL}/wp-json/${path}`, { next: { revalidate: REVALIDATE_SECONDS, tags }, signal: AbortSignal.timeout(8000) });
	} catch (error) {
		throw new WordPressUnavailableError(error instanceof Error ? error.message : "خطا در ارتباط با وردپرس");
	}
}

/** آدرس رسانه‌های وردپرس: همیشه https (جلوگیری از محتوای مختلط و og:image نامعتبر) و با انکدینگ معتبر برای نام فارسی */
function normalizeWpMediaUrl(url?: string | null): string | null {
	if (!url) return null;
	let normalized = url;
	if (wpHost) normalized = normalized.replace(new RegExp(`^http://${wpHost.replace(/\./g, "\\.")}`, "i"), `https://${wpHost}`);
	try {
		return encodeURI(decodeURI(normalized));
	} catch {
		return normalized;
	}
}

/**
 * لینک‌های داخل متن مقاله که به نسخه‌ی وردپرسی یک نوشته (wp.rasmiyab.com/<slug>/) اشاره می‌کنند
 * به نسخه‌ی اصلی روی سایت (/posts/<slug>) برگردانده می‌شوند تا اعتبار لینک به زیردامنه نرود.
 * آدرس‌های چندبخشی (wp-content، دسته، برچسب و...) دست نمی‌خورند؛ فقط http رسانه‌ها https می‌شود.
 */
function rewriteWpContent(html?: string | null): string {
	if (!html || !wpHost) return html ?? "";
	const host = wpHost.replace(/\./g, "\\.");
	return html
		.replace(new RegExp(`href=(["'])https?://${host}/?(["'])`, "gi"), (_m, open, close) => `href=${open}/${close}`)
		.replace(new RegExp(`href=(["'])https?://${host}/(?!wp-)([^/"'?#.]+)/?(["'])`, "gi"), (_m, open, slug, close) => `href=${open}/posts/${slug}${close}`)
		.replace(new RegExp(`http://${host}/`, "gi"), `https://${wpHost}/`);
}

function toBlogPostDto(post: BlogPostDtoApi): BlogPostDto {
	return {
		id: post.id,
		slug: post.slug,
		title: stripHtml(post.title.rendered),
		excerpt: post.excerpt.rendered,
		date: post.date,
		image: normalizeWpMediaUrl(post._embedded?.["wp:featuredmedia"]?.[0]?.source_url),
	};
}

function toBlogPostDetailDto(post: BlogPostDtoApi): BlogPostDetailDto {
	return {
		id: post.id,
		slug: post.slug,
		title: stripHtml(post.title?.rendered),
		content: rewriteWpContent(post.content?.rendered),
		excerpt: post.excerpt?.rendered,
		date: convertToJalali(post.date ?? ""),
		// تاریخ‌های وردپرس timezone ندارند؛ از نسخه‌ی GMT با پسوند Z استفاده می‌کنیم تا ISO معتبر باشد
		dateIso: post.date_gmt ? `${post.date_gmt}Z` : post.date ?? null,
		modifiedIso: post.modified_gmt ? `${post.modified_gmt}Z` : post.modified ?? null,
		image: normalizeWpMediaUrl(post._embedded?.["wp:featuredmedia"]?.[0]?.source_url),
		author: post._embedded?.["author"]?.[0]?.name ?? null,
		rank_math: post?.rank_math,
	};
}

export type PostsPageQuery = { page: number; pageSize: number; term?: string };

/** null یعنی شماره‌ی صفحه بیشتر از تعداد صفحات است (وردپرس ۴۰۰ می‌دهد) و صفحه باید ۴۰۴ شود */
export async function getPostsPage({ page, pageSize, term }: PostsPageQuery): Promise<Paginate<BlogPostDto> | null> {
	const search = term ? `&search=${encodeURIComponent(term)}` : "";
	const res = await wpFetch(`wp/v2/posts?_embed&per_page=${pageSize}&page=${page}&orderby=post_index&order=desc${search}`, [POSTS_CACHE_TAG]);

	if (res.status === 400) {
		const body = await res.json().catch(() => null);
		if (body?.code === "rest_post_invalid_page_number") return null;
	}
	if (!res.ok) throw new WordPressUnavailableError(`WordPress posts: ${res.status}`);

	const data: BlogPostDtoApi[] = await res.json();
	const elements = Array.isArray(data) ? data.map(toBlogPostDto) : [];
	return {
		page,
		pageSize,
		totalPages: parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10) || 1,
		totalElements: parseInt(res.headers.get("x-wp-total") ?? String(elements.length), 10) || elements.length,
		elements,
	};
}

/** null یعنی نوشته وجود ندارد (۴۰۴)؛ خطای موقت وردپرس به‌صورت WordPressUnavailableError پرتاب می‌شود (۵۰۰، نه صفحه‌ی خالی ۲۰۰) */
export async function getPostBySlug(slug: string): Promise<BlogPostDetailDto | null> {
	const res = await wpFetch(`wp/v2/posts?slug=${encodeURIComponent(safeDecode(slug))}&_embed`, [POSTS_CACHE_TAG]);
	if (!res.ok) throw new WordPressUnavailableError(`WordPress post: ${res.status}`);
	const data: BlogPostDtoApi[] = await res.json();
	if (!Array.isArray(data) || !data.length) return null;
	return toBlogPostDetailDto(data[0]);
}

export type PostSitemapEntry = { slug: string; modified?: string };

/** همه‌ی اسلاگ‌ها برای sitemap؛ در صورت خطا آرایه‌ی خالی تا sitemap با بقیه‌ی مسیرها ساخته شود */
export async function getAllPostSlugs(): Promise<PostSitemapEntry[]> {
	const perPage = 100;
	const maxPages = 50;
	try {
		const first = await wpFetch(`wp/v2/posts?per_page=${perPage}&page=1&_fields=slug,modified_gmt`, [POSTS_CACHE_TAG]);
		if (!first.ok) return [];
		const totalPages = Math.min(parseInt(first.headers.get("x-wp-totalpages") || "1", 10) || 1, maxPages);
		let all: { slug?: string; modified_gmt?: string }[] = await first.json();
		if (!Array.isArray(all)) return [];

		for (let page = 2; page <= totalPages; page++) {
			const res = await wpFetch(`wp/v2/posts?per_page=${perPage}&page=${page}&_fields=slug,modified_gmt`, [POSTS_CACHE_TAG]);
			if (!res.ok) break;
			const data = await res.json();
			if (!Array.isArray(data)) break;
			all = all.concat(data);
		}

		return all
			.filter((p): p is { slug: string; modified_gmt?: string } => !!p?.slug)
			.map((p) => ({ slug: p.slug, modified: p.modified_gmt ? `${p.modified_gmt}Z` : undefined }));
	} catch {
		return [];
	}
}

export async function getTopBanner(): Promise<TopBanner | null> {
	try {
		const res = await wpFetch("rasmiyab/v1/home", [HOME_CACHE_TAG]);
		if (!res.ok) return null;
		const data: TopBannerHomeDtoApi = await res.json();
		const media = data?.topbanner?.id;
		if (!media || typeof media === "boolean" || !media.url) return null;
		const link = data?.bannerlink;
		return {
			image: normalizeWpMediaUrl(media.url) ?? media.url,
			alt: media.alt || media.title || "",
			link: typeof link === "string" && link ? link : null,
			width: media.width ?? null,
			height: media.height ?? null,
		};
	} catch {
		return null;
	}
}

/** canonical سفارشی Rank Math فقط وقتی پذیرفته می‌شود که روی دامنه‌ی خود سایت باشد (نه زیردامنه‌ی وردپرس) */
export function resolveRankMathCanonical(canonical?: string | null): string | null {
	if (!canonical) return null;
	try {
		const url = new URL(canonical);
		return url.host === new URL(SITE_BASE_URL).host ? url.toString() : null;
	} catch {
		return null;
	}
}

function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
