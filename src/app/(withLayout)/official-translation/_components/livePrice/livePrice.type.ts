export type LivePriceItem = { translationItemId: string; title: string };

export type LivePriceProps = {
	/** آی‌دی مدرک در سامانه‌ی همین محیط؛ null وقتی مدرک هنوز در سامانه تعریف نشده (فقط پیش‌نمایش) */
	translationItemId: string | null;
	/** صفحه‌ی چندمدرکی: مدارک فعالی که کاربر از بینشان انتخاب می‌کند (بیش از یکی = انتخاب‌گر مدرک نمایش داده می‌شود) */
	items?: LivePriceItem[];
	documentName: string;
	sourcePage: string;
};
