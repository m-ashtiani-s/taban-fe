export type BlogPostDetailDto = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    /** تاریخ خام ISO برای structured data و تگ <time> */
    dateIso: string | null;
    /** تاریخ آخرین ویرایش (ISO) */
    modifiedIso: string | null;
    image: string | null;
    author: string | null;
    rank_math:{
		title:string;
		description:string;
		focus_keyword:string
	}
};
