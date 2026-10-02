import { Metadata } from "next";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";

// تا ماه ۲ که صفحه‌ی فرود واقعی سفارش ساخته شود، این روت فقط اسپینرِ ریدایرکت است و نباید ایندکس شود
export const metadata: Metadata = {
	title: "ثبت سفارش آنلاین ترجمه رسمی",
	robots: { index: false, follow: true },
};

/**
 * روتِ index فلوی سفارش. ورود همیشه از /new-order است (لینک‌های خارجی و handoff هوم‌پیج).
 * لایوت (new-order/layout) روی این روت استیت‌ها را ریست و به مرحله‌ی اول ریدایرکت می‌کند؛
 * این صفحه فقط یک fallback لودینگ است تا زمان ریدایرکت.
 */
export default function Page() {
	return (
		<div className="min-h-[100dvh] w-full flex items-center justify-center gap-2 text-sm text-neutral-500">
			<TabanLoading size={24} />
			در حال آماده‌سازی سفارش شما...
		</div>
	);
}
