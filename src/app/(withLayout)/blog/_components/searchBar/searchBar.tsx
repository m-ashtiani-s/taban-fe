"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TAGS = ["ترجمه رسمی", "ترجمه مدارک", "مهاجرت", "روادید", "دارالترجمه", "تایید وزارت"];

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentTerm = searchParams.get("term") || "";
    const [value, setValue] = useState(currentTerm);

    const doSearch = (q: string) => {
        const params = new URLSearchParams();
        if (q.trim()) params.set("term", q.trim());
        params.set("page", "1");
        startTransition(() => {
            router.push(`/blog?${params.toString()}`);
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doSearch(value);
    };

    const handleTag = (tag: string) => {
        setValue(tag);
        doSearch(tag);
    };

    const handleClear = () => {
        setValue("");
        doSearch("");
    };

    return (
        <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
                <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </span>

                <input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="جستجو در مقالات رسمی‌یاب..."
                    className="w-full h-[52px] rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 pr-12 pl-[110px] outline-none focus:bg-white/15 focus:border-white/40 transition-all duration-200 text-sm"
                />

                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute left-[120px] top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-[40px] px-5 rounded-lg bg-secondary text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                >
                    {isPending && (
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    )}
                    جستجو
                </button>
            </form>

            <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-white/40 text-xs self-center ml-1">جستجوی سریع:</span>
                {TAGS.map(tag => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => handleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                            currentTerm === tag
                                ? "bg-secondary border-secondary text-white"
                                : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white hover:border-white/40"
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}
