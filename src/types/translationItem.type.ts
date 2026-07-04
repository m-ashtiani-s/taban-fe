export type TranslationItem = {
	translationItemId: string;
	title: string;
	documentType: string;
	description: string;
	/** توضیحات راهنمای آپلود مدارک که ادمین می‌نویسد و در مرحله‌ی آپلود نمایش داده می‌شود */
	uploadDescription?: string;
	/** پلیس‌هولدرِ نام مدرک که ادمین می‌نویسد و در ورودیِ نام‌گذاریِ مدرک نمایش داده می‌شود */
	namePlaceholder?: string;
	isActive: boolean;
	categoryId: string;
	categoryName: string;
};
