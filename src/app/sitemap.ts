import { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { DOC_HUB, DOC_LANDINGS_BASE_PATH, docLandingPath } from "@/config/docLandings";
import { getAllPostSlugs } from "@/server/wordpress";
import { getLiveDocLandings } from "@/server/docLandings";

export const revalidate = 3600;

/**
 * فقط صفحات ۲۰۰ و index با همان URLی که canonicalشان است (absoluteUrl همان انکدینگ canonical را می‌سازد).
 * صفحات استاتیک lastModified ندارند چون تاریخ واقعی آخرین تغییر محتوایشان ثبت نمی‌شود؛ «الان» گوگل را گمراه می‌کند.
 */
const STATIC_PATHS = ["/", "/blog", "/about-us", "/contact-us", "/rules"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [posts, liveLandings] = await Promise.all([getAllPostSlugs(), getLiveDocLandings()]);

	const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({ url: absoluteUrl(path) }));

	const hubEntries: MetadataRoute.Sitemap =
		DOC_HUB.status === "published" ? [{ url: absoluteUrl(DOC_LANDINGS_BASE_PATH), ...(DOC_HUB.updatedAt ? { lastModified: DOC_HUB.updatedAt } : {}) }] : [];

	const landingEntries: MetadataRoute.Sitemap = liveLandings.map((landing) => ({
		url: absoluteUrl(docLandingPath(landing.slug)),
		...(landing.updatedAt ? { lastModified: landing.updatedAt } : {}),
	}));

	const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
		url: absoluteUrl(`/posts/${post.slug}`),
		...(post.modified ? { lastModified: post.modified } : {}),
	}));

	return [...staticEntries, ...hubEntries, ...landingEntries, ...postEntries];
}
