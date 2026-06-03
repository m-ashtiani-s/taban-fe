import { SITE_URL } from "@/config/global";
import { SITE_BASE_URL, SITE_NAME } from "@/config/site";
import { BlogPostDetailDto } from "@/types/blogPostDetail.type";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Comments from "../_components/postComment/commentsList";
import PostComment from "../_components/postComment/postcomment";

/** حذف تگ‌های HTML از خلاصه برای استفاده در description/structured data */
function stripHtml(input?: string | null): string {
	return (input || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

type GetPostResult = {
	post: BlogPostDetailDto | null;
	/** خطای گذرا (قطعی وردپرس/شبکه) در برابر «پست واقعاً وجود ندارد» */
	transient: boolean;
};

/**
 * واکشی پست بر اساس slug. کاملاً resilient و بدون crash:
 *  - پاسخ موفق با id  → پست
 *  - ۴۰۴ یا پاسخ خالی → not found واقعی (transient=false)
 *  - خطای شبکه/۵xx    → خطای گذرا (transient=true) تا صفحه به‌جای ۴۰۴، ۵۰۰ بدهد
 *    و گوگل مقاله را drop نکند.
 */
async function getPost(slug: string): Promise<GetPostResult> {
	try {
		const res = await fetch(`${SITE_URL}/api/wordpress/posts/${slug}`, {
			next: { revalidate: 1 },
		});
		if (res.status === 404) return { post: null, transient: false };
		if (!res.ok) return { post: null, transient: true };
		const data = await res.json();
		if (!data || !data.id) return { post: null, transient: false };
		return { post: data as BlogPostDetailDto, transient: false };
	} catch {
		return { post: null, transient: true };
	}
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const { post } = await getPost(params?.slug);

	if (!post || !post.id) {
		return {
			title: "مقاله یافت نشد",
			robots: { index: false, follow: false },
		};
	}

	const seoTitle = post.rank_math?.title?.trim();
	const description = post.rank_math?.description?.trim() || stripHtml(post.excerpt) || undefined;
	const url = `/posts/${post.slug}`;

	return {
		// اگر RankMath عنوان کامل دارد، همان عیناً استفاده می‌شود؛ وگرنه با template برند ترکیب می‌شود
		title: seoTitle ? { absolute: seoTitle } : post.title,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: "article",
			title: seoTitle || post.title,
			description,
			url,
			images: post.image ? [{ url: post.image }] : undefined,
			publishedTime: post.dateIso || undefined,
			modifiedTime: post.modifiedIso || post.dateIso || undefined,
			authors: post.author ? [post.author] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: seoTitle || post.title,
			description,
			images: post.image ? [post.image] : undefined,
		},
	};
}

export default async function Page({ params }: { params: { slug: string } }) {
	const { post, transient } = await getPost(params?.slug);

	// قطعی موقت وردپرس → خطای ۵۰۰ (error.tsx) تا گوگل بعداً retry کند، نه drop
	if (!post && transient) {
		throw new Error("در حال حاضر امکان دریافت مقاله وجود ندارد. لطفاً بعداً تلاش کنید.");
	}
	// پست واقعاً وجود ندارد → ۴۰۴ تمیز (not-found.tsx). در هیچ حالتی crash نمی‌شود.
	if (!post || !post.id) {
		notFound();
	}

	const canonicalUrl = `${SITE_BASE_URL}/posts/${post.slug}`;
	const displayDate = post.date?.split(" ")[0];

	const articleLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: stripHtml(post.excerpt),
		image: post.image ? [post.image] : undefined,
		datePublished: post.dateIso || undefined,
		dateModified: post.modifiedIso || post.dateIso || undefined,
		author: post.author ? { "@type": "Person", name: post.author } : undefined,
		publisher: {
			"@type": "Organization",
			name: SITE_NAME,
			logo: { "@type": "ImageObject", url: `${SITE_BASE_URL}/images/logo2.svg` },
		},
		mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
	};

	const breadcrumbLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "خانه", item: SITE_BASE_URL },
			{ "@type": "ListItem", position: 2, name: "مجله", item: `${SITE_BASE_URL}/blog` },
			{ "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
		],
	};

	return (
		<article>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

			<section className="bg-primary">
				<div className="container">
					<div className="py-16 flex items-center justify-center flex-col gap-2">
						<h1 className="peyda text-3xl font-semibold text-white max-lg:!text-2xl text-center">{post.title}</h1>
						<div className="text-neutral-200 flex gap-4 items-center mt-1">
							{displayDate && (
								<time dateTime={post.dateIso || undefined}>{displayDate}</time>
							)}
							{post.author && (
								<>
									<div className="h-4 w-[1px] bg-neutral-200 relative -top-0.5"></div>
									<div>رسمی‌یاب</div>
								</>
							)}
						</div>
						<div className="flex w-full justify-center"></div>
					</div>
				</div>
			</section>

			<div className="h-10 lg:!h-20"></div>
			<section>
				<div className="container border-b border-b-secondary pb-10 max-lg:!px-4">
					<div className="flex gap-4">
						<div
							style={{ backgroundImage: `url('${post.image ?? ""}')` }}
							className="min-w-36 h-24 !bg-cover rounded-md shadow-md"
						></div>
						<div className="flex flex-col gap-4">
							<div className="peyda text-xl font-semibold flex items-center gap-4 max-lg:!text-lg max-lg:!flex-col max-lg:!gap-1 max-lg:!items-start">
								{post.title}
								<div className="flex gap-4">
									<div className="h-4 w-[1px] bg-neutral-200 relative -top-0.5 max-lg:!hidden"></div>
									{displayDate && <time dateTime={post.dateIso || undefined} className="text-sm font-normal">{displayDate}</time>}
									{post.author && (
										<>
											<div className="h-4 w-[1px] bg-neutral-200 relative -top-0.5"></div>
											<div className="text-sm font-normal">{post.author}</div>
										</>
									)}
								</div>
							</div>
							<div
								className="text-sm max-lg:!hidden"
								dangerouslySetInnerHTML={{ __html: post.excerpt || "" }}
							></div>
						</div>
					</div>
					<div className="text-sm lg:!hidden mt-4" dangerouslySetInnerHTML={{ __html: post.excerpt || "" }}></div>
				</div>
			</section>

			<div className="h-10 lg:!h-20"></div>
			<section>
				<div className="container px-4">
					<div
						className="!leading-7 [&>*]:mt-4 [&>*]:max-w-full [&_>p>img]:mx-auto [&_table]:text-sm [&_tr]:border-b  [&_tr:nth-last-child(1)]:border-none [&_tr]:border-b-neutral-200 [&_td]:border-l [&_td]:border-l-neutral-200 [&_td]:p-1 [&_td:nth-last-child(1)]:border-none [&_a]:text-secondary"
						dangerouslySetInnerHTML={{ __html: post.content || "" }}
					></div>
				</div>
			</section>

			<div className="h-10 lg:!h-20 "></div>
			<div className="flex container border-b border-b-secondary pb-4 max-lg:!px-4">
				<div className="flex items-center gap-2 peyda font-semibold">
					<div className="text-primary  lg:text-lg">نظرات شما</div>
					<div className="h-10 w-0.5 bg-secondary"></div>
					<div className="text-secondary  lg:text-lg">کاربران رسمی یاب درباره این مقاله گفته اند:</div>
				</div>
			</div>
			<section>
				<div className="container px-4">
					<Comments id={post.id} />
					<PostComment id={post.id} />
				</div>
			</section>
			<div className="h-10 lg:!h-20"></div>
		</article>
	);
}
