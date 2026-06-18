import { OrderStatus, PaymentStatus } from "../_types/order.type";

export const orderStatusMeta: Record<OrderStatus, { label: string; className: string; dot: string }> = {
	document_submission: { label: "ثبت مدارک", className: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
	approved: { label: "تایید جهت پرداخت", className: "bg-teal-50 text-teal-600 border-teal-200", dot: "bg-teal-500" },
	paid: { label: "پرداخت‌شده", className: "bg-sky-50 text-sky-600 border-sky-200", dot: "bg-sky-500" },
	admin_registration: { label: "ثبت اداری", className: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" },
	translating: { label: "در حال ترجمه", className: "bg-indigo-50 text-indigo-600 border-indigo-200", dot: "bg-indigo-500" },
	documents_received: { label: "دریافت مدارک", className: "bg-violet-50 text-violet-600 border-violet-200", dot: "bg-violet-500" },
	reviewing: { label: "بازبینی", className: "bg-purple-50 text-purple-600 border-purple-200", dot: "bg-purple-500" },
	certifications: { label: "تاییدات", className: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200", dot: "bg-fuchsia-500" },
	ready_for_delivery: { label: "آماده تحویل", className: "bg-cyan-50 text-cyan-600 border-cyan-200", dot: "bg-cyan-500" },
	translation_scan: { label: "اسکن ترجمه‌ها", className: "bg-pink-50 text-pink-600 border-pink-200", dot: "bg-pink-500" },
	documents_sent: { label: "ارسال مدارک", className: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500" },
	delivered: { label: "تحویل سند", className: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
	needs_editing: { label: "نیازمند ویرایش", className: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500" },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; className: string }> = {
	pending: { label: "در انتظار پرداخت", className: "bg-amber-50 text-amber-600 border-amber-200" },
	paid: { label: "پرداخت‌شده", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
	failed: { label: "ناموفق", className: "bg-rose-50 text-rose-600 border-rose-200" },
};

/** مراحل خطی فلوی سفارش (به‌جز «نیازمند ویرایش» که شاخه‌ی جانبی است) — برای نمایش stepper */
export const orderFlowSteps: { key: OrderStatus; label: string }[] = [
	{ key: "document_submission", label: "ثبت مدارک" },
	{ key: "approved", label: "تایید جهت پرداخت" },
	{ key: "paid", label: "پرداخت شده" },
	{ key: "admin_registration", label: "ثبت اداری" },
	{ key: "translating", label: "در حال ترجمه" },
	{ key: "documents_received", label: "دریافت مدارک" },
	{ key: "reviewing", label: "بازبینی" },
	{ key: "certifications", label: "تاییدات" },
	{ key: "ready_for_delivery", label: "آماده تحویل" },
	{ key: "translation_scan", label: "اسکن ترجمه‌ها" },
	{ key: "documents_sent", label: "ارسال مدارک" },
	{ key: "delivered", label: "تحویل سند" },
];

export type GuideTone =
	| "amber"
	| "teal"
	| "sky"
	| "blue"
	| "indigo"
	| "violet"
	| "purple"
	| "fuchsia"
	| "cyan"
	| "pink"
	| "orange"
	| "emerald"
	| "rose";

/**
 * متن راهنمای هر وضعیت سفارش: به کاربر می‌گوید دقیقا در چه مرحله‌ای است و
 * چه اقدامی (پرداخت، انتظار، اصلاح و ...) از او انتظار می‌رود.
 */
export const orderStatusGuide: Record<OrderStatus, { title: string; description: string; tone: GuideTone }> = {
	document_submission: {
		tone: "amber",
		title: "مدارک شما ثبت شد و در انتظار بررسی است",
		description:
			"سفارش شما ثبت شد و در صف بررسی کارشناسان ماست. پس از تایید، امکان پرداخت برای شما فعال می‌شود. تا پیش از تایید می‌توانید مدارک سفارش را ویرایش کنید؛ فعلاً نیازی به اقدام دیگری نیست.",
	},
	approved: {
		tone: "teal",
		title: "سفارش شما تایید شد و آماده پرداخت است",
		description: "کارشناسان سفارش شما را تایید کردند. برای شروع فرآیند ترجمه، مبلغ سفارش را پرداخت کنید.",
	},
	paid: {
		tone: "sky",
		title: "پرداخت شما با موفقیت انجام شد",
		description: "سفارش شما ثبت نهایی شد و به‌زودی وارد مراحل اداری و ترجمه می‌شود. لازم نیست کاری انجام دهید؛ وضعیت را همین‌جا دنبال کنید.",
	},
	admin_registration: {
		tone: "blue",
		title: "سفارش شما در حال ثبت اداری است",
		description: "سفارش شما در حال ثبت در سامانه‌ی اداری دارالترجمه است. این مرحله مقدمه‌ی شروع ترجمه است.",
	},
	translating: {
		tone: "indigo",
		title: "سفارش شما در حال ترجمه است",
		description: "مترجمان ما در حال ترجمه‌ی اسناد شما هستند. به محض آماده‌شدن، وضعیت سفارش به‌روزرسانی می‌شود.",
	},
	documents_received: {
		tone: "violet",
		title: "مدارک شما دریافت شد",
		description: "اصل مدارک شما توسط دارالترجمه دریافت شد و فرآیند ادامه می‌یابد.",
	},
	reviewing: {
		tone: "purple",
		title: "ترجمه‌ی شما در حال بازبینی است",
		description: "ترجمه‌ی اسناد شما در حال بازبینی و کنترل کیفیت توسط کارشناسان است.",
	},
	certifications: {
		tone: "fuchsia",
		title: "در حال اخذ تاییدات",
		description: "در حال اخذ مهرها و تاییدات لازم (دادگستری، امور خارجه و سفارت) برای اسناد شماست.",
	},
	ready_for_delivery: {
		tone: "cyan",
		title: "سفارش شما آماده‌ی تحویل است",
		description: "ترجمه و تاییدات تکمیل شد و سفارش شما آماده‌ی تحویل است.",
	},
	translation_scan: {
		tone: "pink",
		title: "در حال اسکن ترجمه‌ها",
		description: "نسخه‌ی اسکن ترجمه‌های شما در حال آماده‌سازی است.",
	},
	documents_sent: {
		tone: "orange",
		title: "مدارک شما ارسال شد",
		description: "اسناد ترجمه‌شده برای تحویل به شما ارسال شده است و به‌زودی به دستتان می‌رسد.",
	},
	delivered: {
		tone: "emerald",
		title: "سفارش شما تحویل داده شد",
		description: "سفارش شما با موفقیت تکمیل و تحویل داده شد. از اعتماد و همراهی شما سپاسگزاریم.",
	},
	needs_editing: {
		tone: "rose",
		title: "سفارش شما نیازمند ویرایش است",
		description: "کارشناسان برای تکمیل سفارش نیازمند ویرایش مدارک شما هستند. لطفاً با توجه به توضیحات زیر، مدارک سفارش را اصلاح و دوباره ارسال کنید.",
	},
};

/** کلاس‌های رنگیِ هر تُن برای باکس راهنمای وضعیت */
export const guideToneClasses: Record<GuideTone, { container: string; iconWrap: string; iconColor: string; title: string; text: string }> = {
	amber: { container: "from-amber-50 to-white border-amber-200", iconWrap: "bg-amber-100", iconColor: "stroke-amber-600", title: "text-amber-700", text: "text-amber-700/80" },
	teal: { container: "from-teal-50 to-emerald-50 border-teal-200", iconWrap: "bg-teal-100", iconColor: "stroke-teal-600", title: "text-teal-700", text: "text-teal-700/80" },
	sky: { container: "from-sky-50 to-white border-sky-200", iconWrap: "bg-sky-100", iconColor: "stroke-sky-600", title: "text-sky-700", text: "text-sky-700/80" },
	blue: { container: "from-blue-50 to-white border-blue-200", iconWrap: "bg-blue-100", iconColor: "stroke-blue-600", title: "text-blue-700", text: "text-blue-700/80" },
	indigo: { container: "from-indigo-50 to-white border-indigo-200", iconWrap: "bg-indigo-100", iconColor: "stroke-indigo-600", title: "text-indigo-700", text: "text-indigo-700/80" },
	violet: { container: "from-violet-50 to-white border-violet-200", iconWrap: "bg-violet-100", iconColor: "stroke-violet-600", title: "text-violet-700", text: "text-violet-700/80" },
	purple: { container: "from-purple-50 to-white border-purple-200", iconWrap: "bg-purple-100", iconColor: "stroke-purple-600", title: "text-purple-700", text: "text-purple-700/80" },
	fuchsia: { container: "from-fuchsia-50 to-white border-fuchsia-200", iconWrap: "bg-fuchsia-100", iconColor: "stroke-fuchsia-600", title: "text-fuchsia-700", text: "text-fuchsia-700/80" },
	cyan: { container: "from-cyan-50 to-white border-cyan-200", iconWrap: "bg-cyan-100", iconColor: "stroke-cyan-600", title: "text-cyan-700", text: "text-cyan-700/80" },
	pink: { container: "from-pink-50 to-white border-pink-200", iconWrap: "bg-pink-100", iconColor: "stroke-pink-600", title: "text-pink-700", text: "text-pink-700/80" },
	orange: { container: "from-orange-50 to-white border-orange-200", iconWrap: "bg-orange-100", iconColor: "stroke-orange-600", title: "text-orange-700", text: "text-orange-700/80" },
	emerald: { container: "from-emerald-50 to-white border-emerald-200", iconWrap: "bg-emerald-100", iconColor: "stroke-emerald-600", title: "text-emerald-700", text: "text-emerald-700/80" },
	rose: { container: "from-rose-50 to-white border-rose-200", iconWrap: "bg-rose-100", iconColor: "stroke-rose-600", title: "text-rose-700", text: "text-rose-700/80" },
};
