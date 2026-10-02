export const FOOTER_INTRO =
	"رسمی‌یاب سامانه‌ی ثبت سفارش آنلاین ترجمه رسمی مدارک است. مدرک و زبان ترجمه را انتخاب می‌کنید، هزینه را پیش از پرداخت می‌بینید، تصویر مدارک را بارگذاری می‌کنید و ترجمه‌ی رسمی را همراه با تاییدات مورد نیاز تحویل می‌گیرید. وضعیت سفارش‌ها و سابقه‌ی مدارک هم در پنل کاربری شما در دسترس است.";

export type FooterLink = { title: string; href: string };

export const FOOTER_LINKS: FooterLink[] = [
	{ title: "خانه", href: "/" },
	{ title: "ثبت سفارش ترجمه", href: "/new-order" },
	{ title: "مجله رسمی‌یاب", href: "/blog" },
	{ title: "درباره ما", href: "/about-us" },
	{ title: "تماس با ما", href: "/contact-us" },
	{ title: "قوانین و مقررات رسمی‌یاب", href: "/rules" },
	{ title: "حساب کاربری", href: "/profile" },
];
