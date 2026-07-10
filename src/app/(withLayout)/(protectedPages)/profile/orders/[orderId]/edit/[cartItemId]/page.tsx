import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";

/**
 * روتِ index فلوی ویرایشِ آیتمِ سفارش. لایوت (OrderItemEditLayout → EditFlowLayout) روی این روت
 * به مرحله‌ی اول ریدایرکت می‌کند؛ این صفحه فقط یک fallback لودینگ تا زمان ریدایرکت است.
 */
export default function Page() {
	return (
		<div className="min-h-[60vh] w-full flex items-center justify-center gap-2 text-sm text-neutral-500">
			<TabanLoading size={24} />
			در حال بارگذاری اطلاعات سفارش...
		</div>
	);
}
