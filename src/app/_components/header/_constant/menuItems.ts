type Route = { title: string; href: string; childrens: Route[] };
export const menuItems: Route[] = [
	{
		title: "خانه",
		href: "/",
		childrens: [],
	},
	{
		title: "وبلاگ رسمی یاب",
		href: "/blog/",
		childrens: [],
	},
	{
		title: "ترجمه آنلاین",
		href: "/new-order",
		childrens: [],
	},
	{
		title: "درباره ما",
		href: "/about-us/",
		childrens: [],
	},
	{
		title: "تماس با ما",
		href: "/contact-us/",
		childrens: [],
	},
];
