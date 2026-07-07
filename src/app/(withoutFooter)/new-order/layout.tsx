"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowLine } from "@/app/_components/icon/icons";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { useApi } from "@/hooks/useApi";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { Language } from "@/types/language.type";
import { TranslationItem } from "@/types/translationItem.type";
import { generateUUID } from "@/utils/string";
import { useNewOrderStore } from "./_store/newOrder.store";
import { useOrderRates } from "./_hooks/useOrderRates";
import { StepKey, slugToStep, stepToSlug } from "./_config/steps";
import { OrderFlowProvider } from "./_context/orderFlow.context";
import OrderStepper from "./_components/orderStepper/orderStepper";

/** ساخت نام‌های پیش‌فرض مدارک (وقتی کاربر خودش نام نمی‌گذارد، مثلا تک‌مدرک) */
function buildDefaultNames(title: string, count: number): Record<string, string> {
	const names: Record<string, string> = {};
	for (let i = 0; i < count; i++) {
		// تک‌مدرک با نام پیش‌فرض پر می‌شود؛ چندمدرک خالی می‌ماند تا کاربر خودش وارد کند (اجباری)
		names[generateUUID()] = count === 1 ? `${title} شماره ${i + 1}` : "";
	}
	return names;
}

/** overlay لودینگ مشترک (آماده‌سازی سفارش / ریدایرکت اولیه) */
function FlowLoading() {
	return (
		<div className="min-h-[100dvh] w-full flex items-center justify-center gap-2 text-sm text-neutral-500">
			<TabanLoading size={24} />
			در حال آماده‌سازی سفارش شما...
		</div>
	);
}

/**
 * لایوت فلوی ثبت سفارش جدید.
 *
 * برخلاف فلوی قبلی که کل مراحل در یک صفحه با state مدیریت می‌شد، اینجا هر مرحله یک
 * روتِ واقعی زیر همین لایوت است تا Back/Forward مرورگر بین مراحل کار کند. کل
 * orchestration (نرخ‌ها، handoff، توالی داینامیک، canGoNext و ...) اینجا زندگی می‌کند و
 * چون لایوت بین ناوبریِ مراحل remount نمی‌شود، هیچ داده‌ای موقع عقب/جلو رفتن از بین نمی‌رود.
 * مرحله‌ی جاری از روی URL مشتق می‌شود و ناوبری با router انجام می‌شود.
 */
function NewOrderFlow({ children }: { children: React.ReactNode }) {
	const { order, setOrder, resetOrder } = useNewOrderStore();
	const rates = useOrderRates();
	const router = useRouter();
	const pathname = usePathname();

	// مرحله‌ی جاری از آخرین سِگمنت URL؛ روی /new-order (بدون سگمنت) = null
	const currentStep = useMemo<StepKey | null>(() => slugToStep(pathname.split("/").pop()), [pathname]);

	const count = order?.translationItemCount ?? 1;
	const steps = rates.steps;
	const itemId = order?.translationItem?.translationItemId;
	const languageId = order?.language?.languageId;

	// ناوبری بین مراحل (جایگزین setCurrentStep قبلی)
	const goToStep = useCallback(
		(key: StepKey, opts?: { replace?: boolean }) => {
			const url = `/new-order/${stepToSlug(key)}`;
			if (opts?.replace) router.replace(url);
			else router.push(url);
		},
		[router]
	);

	// ورود از ویجت صفحه‌ی اصلی: مدرک/زبان از query خوانده و سفارش پیش‌پر می‌شود
	const searchParams = useSearchParams();
	const handoffItemId = searchParams.get("item");
	const handoffLanguageId = searchParams.get("lang");
	const handoffCount = Math.max(1, Number(searchParams.get("count")) || 1);
	const hasHandoff = !!handoffItemId;

	// ورود از پنل مشتری سازمانی: سفارش برای یک مشتری زیرمجموعه ثبت می‌شود و آی‌دی آن
	// از طریق query منتقل و در استور سفارش نگه داشته می‌شود تا تا انتهای فلو (افزودن به سبد) همراه بماند.
	const handoffCustomerId = searchParams.get("customerId");

	const [initializing, setInitializing] = useState(hasHandoff);
	const bootstrapped = useRef(false);
	const validityArmed = useRef(false);
	const handoffStarted = useRef(false);
	const handoffApplied = useRef(false);
	// وقتی زبان از هوم‌پیج آمده، پس از آماده‌شدن نرخ‌ها یک‌بار از مرحله‌ی زبان عبور می‌کنیم
	const pendingLanguageSkip = useRef(false);

	const handoffItems = useApi(async () => await TranslationEndpoints.getTranslationItems());
	const handoffLanguages = useApi(async () => await TranslationEndpoints.getLanguages());

	// اولین مونتِ لایوت: اگر مستقیم روی یک روتِ مرحله فرود آمدیم (رفرش/دیپ‌لینک) و handoff نیست،
	// استور in-memory خالی است؛ استیت‌ها را ریست و فلو را از اول شروع می‌کنیم.
	useEffect(() => {
		if (bootstrapped.current) return;
		bootstrapped.current = true;
		if (hasHandoff) return; // مسیر handoff خودش ناوبری/ریست را مدیریت می‌کند
		if (currentStep !== null) {
			resetOrder();
			rates.reset();
			goToStep("selectItem", { replace: true });
		}
	}, []);

	// هر وقت روی /new-order (index) هستیم (ورود اولیه یا بازگشت درون‌برنامه‌ای مثل «ثبت ترجمه جدید»):
	// فلو تازه شروع شود.
	useEffect(() => {
		if (hasHandoff) return;
		if (currentStep !== null) return;
		resetOrder();
		rates.reset();
		goToStep("selectItem", { replace: true });
	}, [currentStep, hasHandoff]);

	// customerId را روی استور نگه می‌داریم (پس از ریست‌های بالا اعمال می‌شود چون این effect بعد از آن‌ها اعلان شده)
	useEffect(() => {
		setOrder((prev) => ({ ...prev, customerId: handoffCustomerId || null }));
	}, [handoffCustomerId]);

	// شروع واکشیِ داده‌های لازم برای بازسازی مدرک/زبان از روی آی‌دی‌های URL
	useEffect(() => {
		if (!hasHandoff || handoffStarted.current) return;
		handoffStarted.current = true;
		handoffItems.fetchData();
		if (handoffLanguageId) handoffLanguages.fetchData();
	}, [hasHandoff, handoffLanguageId]);

	// پس از آماده‌شدن داده‌ها: ست‌کردن سفارش و پرش به مرحله‌ی نام‌گذاری
	useEffect(() => {
		if (!hasHandoff || !initializing || handoffApplied.current) return;
		const itemsReady = !!handoffItems.result;
		const languagesReady = handoffLanguageId ? !!handoffLanguages.result : true;
		if (!itemsReady || !languagesReady) return;

		const item = handoffItems.result?.success
			? handoffItems.result.data?.data?.find((it) => it.translationItemId === handoffItemId) ?? null
			: null;
		const language =
			handoffLanguageId && handoffLanguages.result?.success
				? handoffLanguages.result.data?.data?.find((l) => l.languageId === handoffLanguageId) ?? null
				: null;

		if (item) {
			handoffApplied.current = true;
			rates.reset();
			setOrder((prev) => ({
				...prev,
				translationItem: item,
				translationItemCount: handoffCount,
				translationItemNames: buildDefaultNames(item.title, handoffCount),
				baseRateCount: {},
				specialItems: [],
				mfaCertification: [],
				justiceCertification: [],
				justiceInquiriesItems: [],
				embassyItems: [],
				copyCount: {},
				assetsByDoc: {},
				descriptionByDoc: {},
				...(language ? { language } : {}),
			}));
			// اگر زبان از URL پیش‌انتخاب شده، مستقیم نرخ‌ها رو فچ می‌کنیم.
			// نمی‌توان فقط به effect نرخ‌ها (itemId/languageId) تکیه کرد چون اگر
			// store قبلاً همین مقادیر رو داشته باشه، dep تغییر نمی‌کنه و effect
			// بعد از reset() دوباره فایر نمی‌شه (race condition روی اتصال کُند).
			if (language) {
				rates.fetchAll(item.translationItemId, language.languageId);
				// زبان از هوم‌پیج آمده: هنگام آماده‌شدن نرخ‌ها، در صورت وجود نرخ از مرحله‌ی زبان عبور می‌کنیم
				pendingLanguageSkip.current = true;
			}
			// مرحله‌ی نام‌گذاری همیشه نمایش داده می‌شود؛ کاربر می‌تواند نامِ پیش‌فرضِ تک‌مدرک را هم ویرایش کند
			goToStep("naming", { replace: true });
		} else {
			// مدرکِ handoff پیدا/واکشی نشد: به‌جای گیرکردن روی /new-order، فلو را از اول شروع می‌کنیم
			resetOrder();
			rates.reset();
			goToStep("selectItem", { replace: true });
		}
		setInitializing(false);
	}, [hasHandoff, initializing, handoffItemId, handoffLanguageId, handoffCount, handoffItems.result, handoffLanguages.result]);

	// عبور خودکار از مرحله‌ی زبان وقتی زبان از هوم‌پیج آمده و برای آن ترکیب نرخ وجود دارد.
	// اگر نرخی برای ترکیب نباشد، روی مرحله‌ی زبان می‌مانیم تا کاربر زبان دیگری انتخاب کند.
	useEffect(() => {
		if (!pendingLanguageSkip.current) return;
		if (currentStep !== "language") return;
		if (!rates.attempted || rates.loading) return;
		pendingLanguageSkip.current = false;
		// همان معیارِ بررسیِ نرخ در هوم‌پیج: کافی است نرخ پایه‌ای برای این ترکیب وجود داشته باشد
		const baseRateExists = !!(rates.baseRate.result?.success && (rates.baseRate.result.data?.data?.length ?? 0) > 0);
		if (baseRateExists) {
			const idx = steps.indexOf("language");
			if (idx >= 0 && idx + 1 < steps.length) goToStep(steps[idx + 1], { replace: true });
		}
		setInitializing(false);
	}, [currentStep, rates.attempted, rates.loading, rates.baseRate.result, steps, goToStep]);

	// فچ مرکزی نرخ‌ها پس از مشخص‌شدن مدرک و زبان (با dedup داخلی useOrderRates)
	useEffect(() => {
		if (itemId && languageId) rates.fetchAll(itemId, languageId);
	}, [itemId, languageId]);

	// همگام‌سازی نام مدارک با تعداد انتخاب‌شده (کلیدهای موجود حفظ می‌شوند تا داده‌ی مراحل بعد معتبر بماند)
	useEffect(() => {
		if (!order?.translationItem) return;
		const title = order?.translationItem?.title ?? "مدرک";
		const existing = order?.translationItemNames ?? {};
		const existingKeys = Object.keys(existing);
		if (existingKeys.length === count && existingKeys.length > 0) return;

		const next: Record<string, string> = {};
		for (let i = 0; i < count; i++) {
			const key = existingKeys[i] ?? generateUUID();
			if (count === 1) {
				next[key] = existing[key] ?? `${title} شماره ${i + 1}`;
			} else {
				// چندمدرک: نام پیش‌فرض نمایش داده نمی‌شود؛ فقط نام‌های واقعیِ واردشده حفظ می‌شوند.
				// هنگام گذار از تک‌مدرک به چندمدرک، نامِ پیش‌فرضِ تک‌مدرک هم پاک می‌شود.
				next[key] = existingKeys.length > 1 ? existing[key] ?? "" : "";
			}
		}
		setOrder((prev) => ({ ...prev, translationItemNames: next }));
	}, [count, order?.translationItem?.translationItemId]);

	// اگر مرحله‌ی جاری بر اثر تغییر توالی حذف شد، به نزدیک‌ترین مرحله‌ی معتبر برگرد.
	// اولین اجرای این effect (کامیت مونت) نادیده گرفته می‌شود تا با ریدایرکتِ اولیه رقابت نکند.
	useEffect(() => {
		if (!validityArmed.current) {
			validityArmed.current = true;
			return;
		}
		if (initializing || currentStep === null) return;
		if (!steps.includes(currentStep)) goToStep("language", { replace: true });
	}, [steps, currentStep, initializing, goToStep]);

	const currentIndex = currentStep ? Math.max(0, steps.indexOf(currentStep)) : 0;
	const isFirst = currentIndex === 0;
	const isLast = currentStep === "checkout";

	const names = order?.translationItemNames ?? {};
	const docKeys = Object.keys(names);

	/** انتخاب مدرک: با تغییر مدرک، داده‌های وابسته‌ی مراحل بعدی پاک می‌شوند */
	const onSelectItem = (item: TranslationItem) => {
		if (item.translationItemId === order?.translationItem?.translationItemId) return;
		rates.reset();
		setOrder((prev) => ({
			...prev,
			translationItem: item,
			translationItemCount: 1,
			translationItemNames: {},
			baseRateCount: {},
			specialItems: [],
			mfaCertification: [],
			justiceCertification: [],
			justiceInquiriesItems: [],
			embassyItems: [],
			copyCount: {},
			assetsByDoc: {},
			descriptionByDoc: {},
		}));
	};

	/** انتخاب زبان: نرخ‌ها وابسته به زبان‌اند، پس انتخاب‌های وابسته به نرخ پاک می‌شوند */
	const onSelectLanguage = (language: Language) => {
		if (language.languageId === order?.language?.languageId) return;
		rates.reset();
		setOrder((prev) => ({
			...prev,
			language,
			baseRateCount: {},
			specialItems: [],
			mfaCertification: [],
			justiceCertification: [],
			justiceInquiriesItems: [],
			embassyItems: [],
			copyCount: {},
			assetsByDoc: {},
		}));
	};

	/** بازگشت به ابتدای فلو (پس از ثبت موفق سفارش) بدون افزودن history اضافه */
	const resetSteps = () => {
		rates.reset();
		goToStep("selectItem", { replace: true });
	};

	const canGoNext = useMemo(() => {
		if (!currentStep) return false;
		switch (currentStep) {
			case "selectItem":
				return !!order?.translationItem;
			case "naming":
				return docKeys.length > 0 && docKeys.every((k) => (names[k] ?? "").trim().length > 0);
			case "language":
				return !!order?.language && rates.attempted && !rates.loading;
			case "base":
				return docKeys.every((k) => Number(order?.baseRateCount?.[k]) > 0);
			case "embassy":
				// اگر برای مدرکی تمایل به تایید سفارت ابراز شده (ورودی وجود دارد)، حداقل یک سفارت باید انتخاب شود
				return (order?.embassyItems ?? []).every((it) => (it?.embassies?.length ?? 0) > 0);
			case "upload":
				return docKeys.length > 0 && docKeys.every((k) => (order?.assetsByDoc?.[k]?.length ?? 0) > 0);
			case "passport":
				return (order?.passports?.length ?? 0) > 0;
			default:
				return true;
		}
	}, [currentStep, order, names, docKeys, rates.attempted, rates.loading]);

	const goNext = () => {
		if (!canGoNext || isLast || !currentStep) return;
		const next = steps[currentIndex + 1];
		if (next) goToStep(next);
	};

	const goPrev = () => {
		if (isFirst || !currentStep) return;
		const prev = steps[currentIndex - 1];
		if (prev) goToStep(prev);
	};

	const ratesFailed =
		rates.attempted &&
		!rates.loading &&
		!rates.baseRate.result?.success &&
		!rates.dynamicRates.result?.success &&
		!rates.certifications.result?.success &&
		!rates.justiceInquiries.result?.success;

	if (initializing || currentStep === null) {
		return <FlowLoading />;
	}

	return (
		<OrderFlowProvider value={{ rates, onSelectItem, onSelectLanguage, resetSteps }}>
			<div className="min-h-[100dvh] w-full bg-gradient-to-b from-secondary/[0.04] to-transparent py-8 lg:py-12 max-lg:px-4">
				<div className="container">
					<div className="max-w-5xl mx-auto flex flex-col gap-8">
						<div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur px-5 py-5 lg:px-8">
							<OrderStepper steps={steps} currentStep={currentStep} />
						</div>
						<div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 lg:p-10 min-h-[420px]">
							{currentStep === "language" && ratesFailed ? (
								<div className="flex flex-col gap-6">
									{children}
									<div className="flex justify-center">
										<ErrorComponent
											executeFunction={() => rates.retryAll()}
											ticketAble
											errorText="آماده‌سازی گزینه‌های این زبان با خطا مواجه شد."
										/>
									</div>
								</div>
							) : (
								<motion.div
									key={currentStep}
									initial={{ opacity: 0, x: 16 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.25, ease: "easeOut" }}
								>
									{children}
								</motion.div>
							)}
						</div>
						<div className="flex items-center justify-between gap-3">
							<TabanButton variant="text" onClick={goPrev} disabled={isFirst}>
								مرحله قبلی
							</TabanButton>

							{!isLast && (
								<TabanButton onClick={goNext} disabled={!canGoNext} icon={<IconArrowLine />}>
									مرحله بعدی
								</TabanButton>
							)}
						</div>
					</div>
				</div>
			</div>
		</OrderFlowProvider>
	);
}

export default function NewOrderLayout({ children }: { children: React.ReactNode }) {
	// useSearchParams داخل NewOrderFlow نیازمند مرز Suspense است
	return (
		<Suspense fallback={<FlowLoading />}>
			<NewOrderFlow>{children}</NewOrderFlow>
		</Suspense>
	);
}
