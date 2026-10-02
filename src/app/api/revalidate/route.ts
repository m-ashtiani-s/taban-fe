import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { HOME_CACHE_TAG, POSTS_CACHE_TAG } from "@/server/wordpress";
import { TRANSLATION_ITEMS_CACHE_TAG } from "@/server/docLandings";

const ALLOWED_TAGS = [POSTS_CACHE_TAG, HOME_CACHE_TAG, TRANSLATION_ITEMS_CACHE_TAG];

/**
 * وبهوک باطل‌سازی کش: وردپرس با انتشار/ویرایش نوشته (posts، wp-home) و پنل ادمین با تغییر مدارک
 * (translation-items) صدایش می‌زنند تا صفحه‌ی اصلی، /blog، /posts، صفحات مدرک و sitemap فوراً به‌روز شوند.
 * فراخواننده باید هدر x-revalidate-secret را با مقدار REVALIDATE_SECRET بفرستد.
 * بدنه‌ی اختیاری: { "tag": "posts" | "wp-home" | "translation-items" }؛ بدون بدنه همه‌ی تگ‌ها باطل می‌شوند.
 */
export async function POST(req: Request) {
	const secret = process.env.REVALIDATE_SECRET;
	const provided = req.headers.get("x-revalidate-secret") ?? new URL(req.url).searchParams.get("secret");
	if (!secret || provided !== secret) {
		return NextResponse.json({ revalidated: false, message: "unauthorized" }, { status: 401 });
	}

	const body = await req.json().catch(() => null);
	const requested = typeof body?.tag === "string" ? body.tag : null;
	if (requested && !ALLOWED_TAGS.includes(requested)) {
		return NextResponse.json({ revalidated: false, message: "unknown tag" }, { status: 400 });
	}

	const tags = requested ? [requested] : ALLOWED_TAGS;
	tags.forEach((tag) => revalidateTag(tag));
	return NextResponse.json({ revalidated: true, tags });
}
