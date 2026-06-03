import { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/config/site";
import { WP_URL } from "@/config/global";

/** صفحات استاتیکِ قابل ایندکس */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
	{ path: "", priority: 1, changeFrequency: "daily" },
	{ path: "/blog", priority: 0.8, changeFrequency: "daily" },
	{ path: "/about-us", priority: 0.5, changeFrequency: "monthly" },
];

type WpSlug = { slug?: string; modified?: string };

/**
 * واکشی همه‌ی اسلاگ‌های پست از وردپرس برای ساخت آدرس‌های /posts/<slug>.
 * کاملاً resilient: اگر WP در دسترس نباشد یا پاسخ نامعتبر بدهد، آرایه‌ی خالی
 * برمی‌گرداند تا sitemap همچنان با مسیرهای استاتیک ساخته شود (سایت نمی‌ترکد).
 */
async function getAllPostSlugs(): Promise<WpSlug[]> {
	if (!WP_URL) return [];

	const perPage = 100;
	const maxPages = 50; // سقف ایمنی برای جلوگیری از حلقه‌ی بی‌انتها

	try {
		const firstRes = await fetch(
			`${WP_URL}/wp-json/wp/v2/posts?per_page=${perPage}&page=1&_fields=slug,modified`,
			{ next: { revalidate: 3600 } }
		);
		if (!firstRes.ok) return [];

		const totalPages = Math.min(parseInt(firstRes.headers.get("x-wp-totalpages") || "1", 10) || 1, maxPages);
		const firstData = await firstRes.json();
		let all: WpSlug[] = Array.isArray(firstData) ? firstData : [];

		for (let page = 2; page <= totalPages; page++) {
			try {
				const res = await fetch(
					`${WP_URL}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_fields=slug,modified`,
					{ next: { revalidate: 3600 } }
				);
				if (!res.ok) break;
				const data = await res.json();
				if (Array.isArray(data)) all = all.concat(data);
				else break;
			} catch {
				break;
			}
		}

		return all.filter((p) => !!p?.slug);
	} catch {
		return [];
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();

	const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
		url: `${SITE_BASE_URL}${r.path}`,
		lastModified: now,
		changeFrequency: r.changeFrequency,
		priority: r.priority,
	}));

	const posts = await getAllPostSlugs();
	const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
		url: `${SITE_BASE_URL}/posts/${p.slug}`,
		lastModified: p.modified ? new Date(p.modified) : now,
		changeFrequency: "weekly",
		priority: 0.7,
	}));

	return [...staticEntries, ...postEntries];
}
