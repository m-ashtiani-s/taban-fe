"use client";

import EditStepContent from "@/app/(withLayout)/(protectedPages)/_orderEditFlow/editStepContent";

/**
 * روتِ هر مرحله‌ی ویرایشِ آیتمِ سفارش. محتوای مرحله‌ی جاری را (بر اساس سگمنتِ URL) رندر می‌کند؛
 * کل state و ناوبری در لایوت (EditFlowLayout) مدیریت می‌شود.
 */
export default function Page() {
	return <EditStepContent />;
}
