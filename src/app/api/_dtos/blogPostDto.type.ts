export type BlogPostDto = {
	id: string;
	slug: string;
	title: { rendered: string };
	excerpt: { rendered: string };
	date: string;
	_embedded?: {
		["wp:featuredmedia"]?: { source_url: string }[];
	};
};
