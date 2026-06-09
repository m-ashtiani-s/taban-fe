import Link from "next/link";
import { convertToJalaliDate } from "@/utils/dateConverts";
import { ArticleCardProps } from "./articleCard.type";

function stripHtml(html?: string | null) {
    return (html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default function ArticleCard({ post }: ArticleCardProps) {
    const date = convertToJalaliDate(post.date);
    const excerpt = stripHtml(post.excerpt).slice(0, 110);
    return (
        <Link
            href={`/posts/${post.slug}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
        >
            <div className="relative h-[200px] overflow-hidden bg-suppliment shrink-0">
                {post.image ? (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-suppliment to-suppliment-full">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="1.4">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <path d="M3 9h18M9 21V9" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-5 flex flex-col gap-2.5 flex-1">
                <span className="text-secondary text-xs font-semibold">{date}</span>
                <h3 className="peyda text-primary font-bold text-base leading-snug group-hover:text-secondary transition-colors duration-200 line-clamp-2">
                    {post.title}
                </h3>
                <p className="text-neutral-5 text-sm leading-relaxed flex-1 line-clamp-3">{excerpt}</p>
                <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold mt-2 group-hover:gap-2.5 transition-all duration-200">
                    ادامه مطلب
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
