import Link from "next/link";
import { SITE_URL } from "@/config/global";
import { SITE_BASE_URL, SITE_NAME } from "@/config/site";
import { BlogPostDetailDto } from "@/types/blogPostDetail.type";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Comments from "../_components/postComment/commentsList";
import PostComment from "../_components/postComment/postcomment";

function stripHtml(input?: string | null): string {
    return (input || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

type GetPostResult = {
    post: BlogPostDetailDto | null;
    transient: boolean;
};

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
        return { title: "مقاله یافت نشد", robots: { index: false, follow: false } };
    }

    const seoTitle = post.rank_math?.title?.trim();
    const description = post.rank_math?.description?.trim() || stripHtml(post.excerpt) || undefined;
    const url = `/posts/${post.slug}`;

    return {
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

    if (!post && transient) {
        throw new Error("در حال حاضر امکان دریافت مقاله وجود ندارد. لطفاً بعداً تلاش کنید.");
    }
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
        <article className="bg-suppliment min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-primary">
                {post.image && (
                    <>
                        <div
                            className="absolute inset-0 bg-no-repeat bg-cover bg-center"
                            style={{ backgroundImage: `url('${post.image}')` }}
                        />
                        <div className="absolute inset-0 bg-primary/80" />
                    </>
                )}
                <div className="container max-lg:px-4 py-24 relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-sm text-white/50">
                        {displayDate && <time dateTime={post.dateIso || undefined}>{displayDate}</time>}
                        {post.author && (
                            <>
                                <span className="w-px h-4 bg-white/20" />
                                <span>{post.author}</span>
                            </>
                        )}
                    </div>

                    <h1 className="peyda text-white text-[36px] max-lg:text-2xl font-extrabold leading-tight max-w-3xl">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <div
                            className="text-white/55 text-sm leading-loose max-w-2xl [&>p]:m-0"
                            dangerouslySetInnerHTML={{ __html: post.excerpt }}
                        />
                    )}
                </div>
            </section>

            {/* ── Body ── */}
            <section className="py-14">
                <div className="container max-lg:px-4">
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* متن اصلی */}
                        <div className="lg:w-[70%]">
                            <div className="bg-white rounded-2xl p-10 max-lg:p-6 shadow-sm">
                                <div
                                    className="
                                        prose prose-lg max-w-none text-right leading-8
                                        [&>h2]:peyda [&>h2]:text-primary [&>h2]:font-extrabold [&>h2]:text-2xl [&>h2]:mt-8 [&>h2]:mb-4
                                        [&>h3]:peyda [&>h3]:text-primary [&>h3]:font-bold [&>h3]:text-xl [&>h3]:mt-6 [&>h3]:mb-3
                                        [&>p]:text-neutral-6 [&>p]:leading-9 [&>p]:mb-4
                                        [&>ul]:text-neutral-6 [&>ul]:leading-9 [&>ul]:mb-4 [&>ul]:pr-5
                                        [&>ol]:text-neutral-6 [&>ol]:leading-9 [&>ol]:mb-4 [&>ol]:pr-5
                                        [&>li]:mb-1
                                        [&>blockquote]:border-r-4 [&>blockquote]:border-secondary [&>blockquote]:bg-suppliment [&>blockquote]:rounded-l-xl [&>blockquote]:px-6 [&>blockquote]:py-4 [&>blockquote]:my-6 [&>blockquote]:mr-0 [&>blockquote]:text-neutral-5 [&>blockquote]:italic
                                        [&>img]:rounded-xl [&>img]:shadow-md [&>img]:mx-auto [&>img]:max-w-full
                                        [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2
                                        [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-neutral-2 [&_td]:p-2 [&_th]:border [&_th]:border-neutral-2 [&_th]:p-2 [&_th]:bg-suppliment [&_th]:text-primary
                                        [&>*]:mt-4 [&>*:first-child]:mt-0
                                    "
                                    dangerouslySetInnerHTML={{ __html: post.content || "" }}
                                />
                            </div>

                            {/* نظرات */}
                            <div className="mt-10">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-secondary/30">
                                    <div className="peyda text-primary text-lg font-semibold">نظرات شما</div>
                                    <div className="h-8 w-0.5 bg-secondary/50" />
                                    <div className="text-secondary text-sm">کاربران رسمی‌یاب درباره این مقاله گفته‌اند:</div>
                                </div>
                                <Comments id={post.id} />
                                <PostComment id={post.id} />
                            </div>
                        </div>

                        {/* سایدبار */}
                        <aside className="lg:w-[30%] flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
                            {/* اطلاعات مقاله */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                                <h3 className="peyda text-primary font-bold text-base border-b border-neutral-1 pb-3">اطلاعات مقاله</h3>
                                {displayDate && (
                                    <div className="flex items-center gap-3 text-sm text-neutral-5">
                                        <span className="w-8 h-8 rounded-lg bg-suppliment flex items-center justify-center shrink-0">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                        </span>
                                        <span>{displayDate}</span>
                                    </div>
                                )}
                                {post.author && (
                                    <div className="flex items-center gap-3 text-sm text-neutral-5">
                                        <span className="w-8 h-8 rounded-lg bg-suppliment flex items-center justify-center shrink-0">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="2">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </span>
                                        <span>{post.author}</span>
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="bg-primary rounded-2xl p-6 flex flex-col gap-4">
                                <h3 className="peyda text-white font-bold">نیاز به ترجمه رسمی دارید؟</h3>
                                <p className="text-white/55 text-sm leading-loose">
                                    ثبت سفارش آنلاین ترجمه رسمی مدارک با قیمت شفاف و تحویل سریع.
                                </p>
                                <Link
                                    href="/"
                                    className="flex items-center justify-center h-10 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity duration-200"
                                >
                                    ثبت سفارش
                                </Link>
                            </div>

                            {/* بازگشت به مجله */}
                            <Link
                                href="/blog"
                                className="flex items-center gap-2 text-secondary text-sm font-semibold hover:gap-3 transition-all duration-200"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                                بازگشت به مجله
                            </Link>
                        </aside>
                    </div>
                </div>
            </section>
        </article>
    );
}
