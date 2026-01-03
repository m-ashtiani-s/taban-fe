export type BlogPostDetailDto = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    image: string | null;
    author: string | null;
    rank_math_seo:any
};
