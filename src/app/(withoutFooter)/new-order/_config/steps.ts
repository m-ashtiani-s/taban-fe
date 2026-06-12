/**
 * تعریف مراحل فلوی ثبت سفارش.
 *
 * هر «مرحله» (StepKey) یک صفحه‌ی منطقی است. چند مرحله می‌توانند زیر یک
 * «فاز» (Phase) دیده شوند؛ مثلا انتخاب مدرک و نام‌گذاری هر دو زیر فاز «انتخاب مدرک»
 * قرار می‌گیرند و در استپر فقط یک نقطه نمایش داده می‌شوند.
 *
 * توالی مراحل به صورت داینامیک و دقیقا مطابق منطق فلوی قبلی محاسبه می‌شود:
 *   - نرخ پایه فقط اگر برای آن مدرک/زبان نرخ پایه‌ای تعریف شده باشد
 *   - موارد خاص فقط اگر نرخ پویا (dynamic rate) وجود داشته باشد
 *   - تاییدات همیشه در مسیر است
 *   - استعلام‌ها فقط اگر نرخ استعلامی وجود داشته باشد
 */
export type StepKey =
	| "selectItem"
	| "naming"
	| "language"
	| "base"
	| "specials"
	| "certifications"
	| "inquiries"
	| "embassy"
	| "upload"
	| "passport"
	| "copies"
	| "checkout";

export type Phase = {
	title: string;
	steps: StepKey[];
};

/** فازهای استپر به ترتیب نمایش (مرحله‌های اختیاری در صورت نیاز فیلتر می‌شوند) */
export const PHASES: Phase[] = [
	{ title: "انتخاب مدرک", steps: ["selectItem", "naming"] },
	{ title: "انتخاب زبان", steps: ["language"] },
	{ title: "نرخ پایه", steps: ["base"] },
	{ title: "موارد خاص", steps: ["specials"] },
	{ title: "تاییدات", steps: ["certifications"] },
	{ title: "استعلام‌ها", steps: ["inquiries"] },
	{ title: "تایید سفارت", steps: ["embassy"] },
	{ title: "آپلود مدارک", steps: ["upload"] },
	{ title: "آپلود پاسپورت", steps: ["passport"] },
	{ title: "تعداد نسخه", steps: ["copies"] },
	{ title: "پرداخت", steps: ["checkout"] },
];
