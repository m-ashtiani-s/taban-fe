import { OrderStatus, PaymentStatus } from "../_types/order.type";

export const orderStatusMeta: Record<OrderStatus, { label: string; className: string; dot: string }> = {
	pending: { label: "در انتظار بررسی", className: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
	approved: { label: "تایید جهت پرداخت", className: "bg-teal-50 text-teal-600 border-teal-200", dot: "bg-teal-500" },
	paid: { label: "پرداخت‌شده", className: "bg-sky-50 text-sky-600 border-sky-200", dot: "bg-sky-500" },
	processing: { label: "در حال انجام", className: "bg-indigo-50 text-indigo-600 border-indigo-200", dot: "bg-indigo-500" },
	shipped: { label: "ارسال‌شده", className: "bg-violet-50 text-violet-600 border-violet-200", dot: "bg-violet-500" },
	delivered: { label: "تحویل‌شده", className: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
	canceled: { label: "لغو‌شده", className: "bg-neutral-100 text-neutral-500 border-neutral-200", dot: "bg-neutral-400" },
	rejected: { label: "رد‌شده", className: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500" },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; className: string }> = {
	pending: { label: "در انتظار پرداخت", className: "bg-amber-50 text-amber-600 border-amber-200" },
	paid: { label: "پرداخت‌شده", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
	failed: { label: "ناموفق", className: "bg-rose-50 text-rose-600 border-rose-200" },
};

export type GuideTone = "amber" | "teal" | "sky" | "indigo" | "violet" | "emerald" | "neutral" | "rose";

/**
 * متن راهنمای هر وضعیت سفارش: به کاربر می‌گوید دقیقا در چه مرحله‌ای است و
 * چه اقدامی (پرداخت، انتظار، اصلاح و ...) از او انتظار می‌رود.
 */
export const orderStatusGuide: Record<OrderStatus, { title: string; description: string; tone: GuideTone }> = {
	pending: {
		tone: "amber",
		title: "سفارش شما در انتظار بررسی است",
		description:
			"سفارش شما ثبت شد و در صف بررسی کارشناسان ماست. پس از تایید، امکان پرداخت برای شما فعال می‌شود. تا پیش از تایید می‌توانید اسناد سفارش را ویرایش کنید؛ فعلاً نیازی به اقدام دیگری نیست.",
	},
	approved: {
		tone: "teal",
		title: "سفارش شما تایید شد و آماده پرداخت است",
		description: "کارشناسان سفارش شما را تایید کردند. برای شروع فرآیند ترجمه، مبلغ سفارش را پرداخت کنید.",
	},
	paid: {
		tone: "sky",
		title: "پرداخت شما با موفقیت انجام شد",
		description: "سفارش شما ثبت نهایی شد و به‌زودی وارد مرحله ترجمه می‌شود. لازم نیست کاری انجام دهید؛ وضعیت را همین‌جا دنبال کنید.",
	},
	processing: {
		tone: "indigo",
		title: "سفارش شما در حال انجام است",
		description: "مترجمان ما در حال ترجمه اسناد شما هستند. به محض آماده‌شدن، وضعیت سفارش به‌روزرسانی می‌شود.",
	},
	shipped: {
		tone: "violet",
		title: "سفارش شما ارسال شد",
		description: "ترجمه اسناد شما تکمیل و برای تحویل ارسال شده است. به‌زودی به دست شما می‌رسد.",
	},
	delivered: {
		tone: "emerald",
		title: "سفارش شما تحویل داده شد",
		description: "سفارش شما با موفقیت تکمیل و تحویل داده شد. از اعتماد و همراهی شما سپاسگزاریم.",
	},
	canceled: {
		tone: "neutral",
		title: "این سفارش لغو شده است",
		description: "این سفارش دیگر در جریان نیست. در صورت نیاز می‌توانید سفارش جدیدی ثبت کنید.",
	},
	rejected: {
		tone: "rose",
		title: "سفارش شما رد شده است",
		description: "کارشناسان سفارش شما را رد کرده‌اند. لطفاً با توجه به توضیحات زیر، اسناد سفارش را اصلاح و دوباره ارسال کنید.",
	},
};

/** کلاس‌های رنگیِ هر تُن برای باکس راهنمای وضعیت */
export const guideToneClasses: Record<GuideTone, { container: string; iconWrap: string; iconColor: string; title: string; text: string }> = {
	amber: { container: "from-amber-50 to-white border-amber-200", iconWrap: "bg-amber-100", iconColor: "stroke-amber-600", title: "text-amber-700", text: "text-amber-700/80" },
	teal: { container: "from-teal-50 to-emerald-50 border-teal-200", iconWrap: "bg-teal-100", iconColor: "stroke-teal-600", title: "text-teal-700", text: "text-teal-700/80" },
	sky: { container: "from-sky-50 to-white border-sky-200", iconWrap: "bg-sky-100", iconColor: "stroke-sky-600", title: "text-sky-700", text: "text-sky-700/80" },
	indigo: { container: "from-indigo-50 to-white border-indigo-200", iconWrap: "bg-indigo-100", iconColor: "stroke-indigo-600", title: "text-indigo-700", text: "text-indigo-700/80" },
	violet: { container: "from-violet-50 to-white border-violet-200", iconWrap: "bg-violet-100", iconColor: "stroke-violet-600", title: "text-violet-700", text: "text-violet-700/80" },
	emerald: { container: "from-emerald-50 to-white border-emerald-200", iconWrap: "bg-emerald-100", iconColor: "stroke-emerald-600", title: "text-emerald-700", text: "text-emerald-700/80" },
	neutral: { container: "from-neutral-50 to-white border-neutral-200", iconWrap: "bg-neutral-100", iconColor: "stroke-neutral-500", title: "text-neutral-700", text: "text-neutral-500" },
	rose: { container: "from-rose-50 to-white border-rose-200", iconWrap: "bg-rose-100", iconColor: "stroke-rose-600", title: "text-rose-700", text: "text-rose-700/80" },
};
