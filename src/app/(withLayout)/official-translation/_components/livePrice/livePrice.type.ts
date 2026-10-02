export type LivePriceProps = {
	/** آی‌دی مدرک در سامانه‌ی همین محیط؛ null وقتی مدرک هنوز در سامانه تعریف نشده (فقط پیش‌نمایش) */
	translationItemId: string | null;
	documentName: string;
	sourcePage: string;
};
