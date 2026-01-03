export type PostComment1 = {
	id: number;
	post: number;
	parent: number;
	author: number;
	author_name: string;
	author_url: string;
	date: string;
	date_gmt: string;
	content: Content;
	link: string;
	status: string;
	type: string;
	author_avatar_urls: any;
	meta: any[];
	acf: any[];
	_links: Links;
};

export type Content = {
	rendered: string;
};

export type Links = {
	self: Self[];
	collection: Collection[];
	up: Up[];
};

export type Self = {
	href: string;
};

export type Collection = {
	href: string;
};

export type Up = {
	embeddable: boolean;
	post_type: string;
	href: string;
};

export type PostComment = {
	id: string;
	author: string;
	content: {rendered:string};
	date: string;
};
