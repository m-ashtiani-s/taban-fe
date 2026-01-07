export type BlogPostDtoApi = {
	id: number;
	date: string;
	date_gmt: string;

	guid: {
		rendered: string;
	};
	rank_math_seo:any,

	modified: string;
	modified_gmt: string;
	slug: string;
	status: "publish" | "draft" | "private";
	type: "post";
	link: string;

	title: {
		rendered: string;
	};

	content: {
		rendered: string;
		protected: boolean;
	};

	excerpt: {
		rendered: string;
		protected: boolean;
	};

	author: number;
	featured_media: number;

	comment_status: "open" | "closed";
	ping_status: "open" | "closed";
	sticky: boolean;
	template: string;
	format: string;

	meta: {
		footnotes?: string;
		[key: string]: any;
	};

	categories: number[];
	tags: number[];

	class_list: string[];
	rank_math:{
		title:string;
		description:string;
		focus_keyword:string
	},

	_links: {
		self: { href: string }[];
		collection: { href: string }[];
		about: { href: string }[];
		author: { embeddable: boolean; href: string }[];
		replies: { embeddable: boolean; href: string }[];
		"version-history": { count?: number; href: string }[];
		"wp:featuredmedia": { embeddable: boolean; href: string }[];
		"wp:attachment": { href: string }[];
		"wp:term": {
			taxonomy: string;
			embeddable: boolean;
			href: string;
		}[];
		curies: {
			name: string;
			href: string;
			templated: boolean;
		}[];
	};

	_embedded?: {
		author?: {
			id: number;
			name: string;
			url: string;
			description: string;
			link: string;
			slug: string;
			avatar_urls: {
				"24": string;
				"48": string;
				"96": string;
			};
		}[];

		"wp:featuredmedia"?: {
			id: number;
			date: string;
			slug: string;
			type: "attachment";
			link: string;
			title: { rendered: string };
			source_url: string;
			alt_text: string;
			media_details?: {
				width: number;
				height: number;
				sizes?: {
					thumbnail?: { source_url: string; width: number; height: number };
					medium?: { source_url: string; width: number; height: number };
					large?: { source_url: string; width: number; height: number };
					full?: { source_url: string; width: number; height: number };
				};
			};
		}[];

		"wp:term"?: [
			{
				id: number;
				link: string;
				name: string;
				slug: string;
				taxonomy: "category";
			}[],
			{
				id: number;
				link: string;
				name: string;
				slug: string;
				taxonomy: "post_tag";
			}[],
		];
	};
};
