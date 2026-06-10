import Link from "next/link";
import { Suspense } from "react";
import { Metadata } from "next";
import { SITE_URL } from "@/config/global";
import { BlogPostDto } from "@/types/blogPost.type";
import { Paginate } from "@/types/paginate";
import ArticleCard from "./_components/articleCard/articleCard";
import FeaturedCard from "./_components/featuredCard/featuredCard";
import SearchBar from "./_components/searchBar/searchBar";

export async function generateMetadata({ searchParams }: { searchParams: { page?: string; term?: string } }): Promise<Metadata> {
    const page = parseInt(searchParams?.page || "1", 10);
    const term = searchParams?.term || "";
    const canonical = term ? `/blog?term=${encodeURIComponent(term)}` : page > 1 ? `/blog?page=${page}` : "/blog";
    const description = "جدیدترین اخبار و مقالات در حوزه‌ی ترجمه‌ی رسمی مدارک، مهاجرت و خدمات دارالترجمه‌ی رسمی‌یاب.";
    return {
        title: term ? `نتایج جستجو برای «${term}» | مجله رسمی‌یاب` : "مجله رسمی‌یاب | مقالات تخصصی ترجمه",
        description,
        alternates: { canonical },
        openGraph: { title: "مجله رسمی‌یاب", description, url: canonical, type: "website" },
    };
}

async function getPosts(page: number, perPage: number, term = ""): Promise<Paginate<BlogPostDto> | null> {
    try {
        const url =
            `${SITE_URL}/api/wordpress/posts?page=${page}&pageSize=${perPage}` +
            (term ? `&term=${encodeURIComponent(term)}` : "");
        const res = await fetch(url, { next: { revalidate: 1 } });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function BlogPage({ searchParams }: { searchParams: { page?: string; term?: string } }) {
    const currentPage = parseInt(searchParams.page || "1", 10);
    const term = searchParams.term || "";
    const PER_PAGE = 9;

    const data = await getPosts(currentPage, PER_PAGE, term);

    return (
        <div className="bg-suppliment min-h-[100dvh]">
            {/* ── Hero ── */}
            <section className="relative bg-primary overflow-hidden">
                <div
                    className="absolute -top-32 right-0 w-[900px] h-[600px] pointer-events-none bg-no-repeat bg-contain opacity-[0.04]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 20px)`,
                        maskImage: "radial-gradient(ellipse 80% 80% at top right, black 0%, transparent 85%)",
                        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at top right, black 0%, transparent 85%)",
                    }}
                />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 text-white/[0.03] text-[180px] font-extrabold select-none pointer-events-none leading-none whitespace-nowrap max-lg:hidden">
                    MAGAZINE
                </div>
                <div
                    className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-secondary/25 to-transparent max-lg:hidden"
                    style={{ right: "15%" }}
                />
                <div
                    className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent max-lg:hidden"
                    style={{ left: "15%" }}
                />

                <div className="container max-lg:px-4 relative z-10 flex flex-col items-center text-center gap-8 pt-32 pb-16">
                    <h1 className="flex gap-2">
                        <span className="text-[56px] max-xl:text-[44px] max-lg:text-[36px] font-extrabold text-white leading-tight peyda">
                            مقالات
                        </span>
                        <span className="text-[56px] max-xl:text-[44px] max-lg:text-[36px] font-extrabold text-secondary leading-tight peyda">
                            تخصصی
                        </span>
                    </h1>

                    <p className="text-white/50 max-w-md leading-loose text-sm">
                        راهنمای ترجمه رسمی مدارک، مهاجرت
                        <br className="max-lg:hidden" /> و پاسخ به سوالات رایج دارالترجمه
                    </p>

                    <Suspense
                        fallback={
                            <div className="w-full max-w-2xl h-[52px] rounded-xl bg-white/10 border border-white/20 animate-pulse" />
                        }
                    >
                        <SearchBar />
                    </Suspense>

                    {term && (
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                            <span>نتایج جستجو برای:</span>
                            <span className="text-secondary font-semibold">«{term}»</span>
                            <Link href="/blog" className="text-white/40 hover:text-white/70 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </Link>
                        </div>
                    )}

                    <div className="flex items-center gap-8 pt-4 border-t border-white/10 w-full max-w-xl justify-center">
                        {[
                            { n: data?.totalElements ? `+${data.totalElements}` : "---", l: "مقاله منتشرشده" },
                            { n: "+۱۰", l: "سال تجربه" },
                            { n: "+۵۰۰۰", l: "ترجمه موفق" },
                        ].map((s) => (
                            <div key={s.l} className="flex flex-col items-center gap-0.5">
                                <span className="text-secondary font-extrabold text-xl">{s.n}</span>
                                <span className="text-white/35 text-xs">{s.l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Posts ── */}
            <section className="py-16">
                <div className="container max-lg:px-4 flex flex-col gap-12">
                    {!data ? (
                        <div className="bg-white rounded-2xl p-16 text-center flex flex-col items-center gap-4 shadow-sm">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA0B0" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-neutral-5 text-base">خطا در دریافت مقالات. لطفاً دوباره تلاش کنید.</p>
                            <a href="/blog" className="text-secondary text-sm font-semibold">بازگشت به مجله</a>
                        </div>
                    ) : data.elements.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center flex flex-col items-center gap-4 shadow-sm">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA0B0" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <p className="text-neutral-5 text-base">
                                {term ? `نتیجه‌ای برای «${term}» یافت نشد.` : "مقاله‌ای یافت نشد."}
                            </p>
                            <Link href="/blog" className="text-secondary text-sm font-semibold">مشاهده همه مقالات</Link>
                        </div>
                    ) : (
                        <>
                            {currentPage === 1 && !term && data.elements.length >= 3 && (
                                <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-5" style={{ gridTemplateRows: "1fr" }}>
                                    <div className="col-span-2 max-lg:col-span-1 min-h-[360px]">
                                        <FeaturedCard post={data.elements[0]} />
                                    </div>
                                    <div className="flex flex-col gap-5">
                                        {data.elements.slice(1, 3).map((p) => (
                                            <ArticleCard key={p.id} post={p} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-5">
                                {(currentPage === 1 && !term && data.elements.length >= 3
                                    ? data.elements.slice(3)
                                    : data.elements
                                ).map((p) => (
                                    <ArticleCard key={p.id} post={p} />
                                ))}
                            </div>
                        </>
                    )}

                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Link
                                href={currentPage > 1 ? `/blog?page=${currentPage - 1}${term ? `&term=${encodeURIComponent(term)}` : ""}` : "#"}
                                aria-disabled={currentPage === 1}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                                    currentPage === 1
                                        ? "pointer-events-none border-neutral-2 text-neutral-3 bg-white"
                                        : "border-primary/20 text-primary bg-white hover:bg-suppliment hover:border-primary/40 shadow-sm"
                                }`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>

                            <div className="flex items-center gap-1.5">
                                {(() => {
                                    const total = data.totalPages;
                                    const cur = currentPage;
                                    const pages: (number | "...")[] = [];

                                    if (total <= 7) {
                                        for (let i = 1; i <= total; i++) pages.push(i);
                                    } else {
                                        pages.push(1);
                                        if (cur > 3) pages.push("...");
                                        for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
                                        if (cur < total - 2) pages.push("...");
                                        pages.push(total);
                                    }

                                    return pages.map((pg, idx) =>
                                        pg === "..." ? (
                                            <span key={`dots-${idx}`} className="w-9 text-center text-neutral-4 text-sm">
                                                ...
                                            </span>
                                        ) : (
                                            <Link
                                                key={pg}
                                                href={`/blog?page=${pg}${term ? `&term=${encodeURIComponent(term)}` : ""}`}
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                                                    pg === cur
                                                        ? "bg-primary text-white shadow-md scale-110"
                                                        : "bg-white text-primary hover:bg-suppliment hover:text-secondary shadow-sm"
                                                }`}
                                            >
                                                {pg}
                                            </Link>
                                        )
                                    );
                                })()}
                            </div>

                            <Link
                                href={currentPage < data.totalPages ? `/blog?page=${currentPage + 1}${term ? `&term=${encodeURIComponent(term)}` : ""}` : "#"}
                                aria-disabled={currentPage === data.totalPages}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                                    currentPage === data.totalPages
                                        ? "pointer-events-none border-neutral-2 text-neutral-3 bg-white"
                                        : "border-primary/20 text-primary bg-white hover:bg-suppliment hover:border-primary/40 shadow-sm"
                                }`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
