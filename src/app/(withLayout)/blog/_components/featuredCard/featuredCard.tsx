import Link from "next/link";
import { convertToJalaliDate } from "@/utils/dateConverts";
import { FeaturedCardProps } from "./featuredCard.type";

function stripHtml(html?: string | null) {
    return (html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default function FeaturedCard({ post }: FeaturedCardProps) {
    const date = convertToJalaliDate(post.date);
    const excerpt = stripHtml(post.excerpt).slice(0, 140);
    return (
        <Link
            href={`/posts/${post.slug}`}
            className="group relative rounded-2xl overflow-hidden shadow-xl block lg:h-full min-h-[360px]"
        >
            {post.image ? (
                <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-primary/10" />
            <div className="absolute top-5 right-5 bg-secondary text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">
                ویژه
            </div>
            <div className="absolute bottom-0 right-0 left-0 p-8 max-lg:p-5 flex flex-col gap-3">
                <span className="text-secondary text-xs font-semibold">{date}</span>
                <h2 className="peyda text-white text-2xl lg:text-[28px] font-extrabold leading-snug line-clamp-2 group-hover:text-secondary transition-colors duration-200">
                    {post.title}
                </h2>
                <p className="text-white/55 text-sm leading-relaxed line-clamp-2 max-lg:hidden">{excerpt}</p>
                <div className="flex items-center gap-2 text-secondary text-sm font-semibold mt-1 group-hover:gap-3 transition-all duration-200">
                    ادامه مطلب
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
