/**
 * فیلد سفارشی rank_math در REST وردپرس. robots و canonical فعلاً از سمت وردپرس فرستاده نمی‌شوند؛
 * اگر افزونه/فیلد REST آن‌ها را اضافه کند، صفحه‌ی مقاله خودکار رعایتشان می‌کند.
 */
export type RankMathSeo = {
	title: string;
	description: string;
	focus_keyword: string;
	robots?: string[];
	canonical?: string;
};
