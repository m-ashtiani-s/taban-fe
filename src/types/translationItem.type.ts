export type TranslationItem = {
	translationItemId: string;
	title: string;
	documentType: string;
	description: string;
	/** توضیحات راهنمای آپلود مدارک که ادمین می‌نویسد و در مرحله‌ی آپلود نمایش داده می‌شود */
	uploadDescription?: string;
	isActive: boolean;
	categoryId: string;
	categoryName: string;
};
