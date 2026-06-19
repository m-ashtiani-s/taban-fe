"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowLine } from "@/app/_components/icon/icons";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { useApi } from "@/hooks/useApi";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { Language } from "@/types/language.type";
import { TranslationItem } from "@/types/translationItem.type";
import { useNewOrderStore } from "../../_store/newOrder.store";
import { useOrderRates } from "../../_hooks/useOrderRates";
import { generateUUID } from "@/utils/string";
import { StepKey } from "../../_config/steps";
import OrderStepper from "../orderStepper/orderStepper";
import SelectItemStep from "../steps/selectItemStep/selectItemStep";
import NamingStep from "../steps/namingStep/namingStep";
import LanguageStep from "../steps/languageStep/languageStep";
import BaseStep from "../steps/baseStep/baseStep";
import SpecialsStep from "../steps/specialsStep/specialsStep";
import CertificationsStep from "../steps/certificationsStep/certificationsStep";
import InquiriesStep from "../steps/inquiriesStep/inquiriesStep";
import EmbassyStep from "../steps/embassyStep/embassyStep";
import UploadStep from "../steps/uploadStep/uploadStep";
import PassportStep from "../steps/passportStep/passportStep";
import CopiesStep from "../steps/copiesStep/copiesStep";
import ScanStep from "../steps/scanStep/scanStep";
import CheckoutStep from "../steps/checkoutStep/checkoutStep";

/** ساخت نام‌های پیش‌فرض مدارک (وقتی کاربر خودش نام نمی‌گذارد، مثلا تک‌مدرک) */
function buildDefaultNames(title: string, count: number): Record<string, string> {
	const names: Record<string, string> = {};
	for (let i = 0; i < count; i++) {
		names[generateUUID()] = `${title} شماره ${i + 1}`;
	}
	return names;
}

/**
 * ارکستریتور فلوی ثبت سفارش جدید.
 *
 * برخلاف فلوی صفحه‌ایِ قبلی، مراحل اینجا با state مدیریت می‌شوند و توالی آن‌ها
 * به صورت داینامیک از روی نرخ‌های دریافت‌شده (useOrderRates) محاسبه می‌شود؛
 * منطق و شکل دیتای سفارش دقیقا مطابق فلوی قبلی باقی مانده است.
 */
export default function NewOrder() {
	const { order, setOrder } = useNewOrderStore();
	const rates = useOrderRates();
	const [currentStep, setCurrentStep] = useState<StepKey>("selectItem");

	const count = order?.translationItemCount ?? 1;
	// مرحله‌ی نام‌گذاری فقط وقتی لازم است که بیش از یک نسخه باشد؛ تک‌مدرک خودکار نام‌گذاری می‌شود
	const steps = useMemo(
		() => (count > 1 ? rates.steps : rates.steps.filter((s) => s !== "naming")),
		[rates.steps, count]
	);
	const itemId = order?.translationItem?.translationItemId;
	const languageId = order?.language?.languageId;

	// ورود از ویجت صفحه‌ی اصلی: مدرک/زبان از query خوانده و سفارش پیش‌پر می‌شود
	const searchParams = useSearchParams();
	const handoffItemId = searchParams.get("item");
	const handoffLanguageId = searchParams.get("lang");
	const handoffCount = Math.max(1, Number(searchParams.get("count")) || 1);
	const hasHandoff = !!handoffItemId;

	const [initializing, setInitializing] = useState(hasHandoff);
	const handoffStarted = useRef(false);

	const handoffItems = useApi(async () => await TranslationEndpoints.getTranslationItems());
	const handoffLanguages = useApi(async () => await TranslationEndpoints.getLanguages());

	// شروع واکشیِ داده‌های لازم برای بازسازی مدرک/زبان از روی آی‌دی‌های URL
	useEffect(() => {
		if (!hasHandoff || handoffStarted.current) return;
		handoffStarted.current = true;
		handoffItems.fetchData();
		if (handoffLanguageId) handoffLanguages.fetchData();
	}, [hasHandoff, handoffLanguageId]);

	// پس از آماده‌شدن داده‌ها: ست‌کردن سفارش و پرش به مرحله‌ی نام‌گذاری
	useEffect(() => {
		if (!hasHandoff || !initializing) return;
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
				...(language ? { language } : {}),
			}));
			// تک‌مدرک نیازی به نام‌گذاری ندارد؛ مستقیم به انتخاب زبان می‌رویم
			setCurrentStep(handoffCount > 1 ? "naming" : "language");
			// اگر زبان از URL پیش‌انتخاب شده، مستقیم نرخ‌ها رو فچ می‌کنیم.
			// نمی‌توان فقط به effect نرخ‌ها (itemId/languageId) تکیه کرد چون اگر
			// store قبلاً همین مقادیر رو داشته باشه، dep تغییر نمی‌کنه و effect
			// بعد از reset() دوباره فایر نمی‌شه (race condition روی اتصال کُند).
			if (language) {
				rates.fetchAll(item.translationItemId, language.languageId);
			}
		}
		setInitializing(false);
	}, [hasHandoff, initializing, handoffItemId, handoffLanguageId, handoffCount, handoffItems.result, handoffLanguages.result]);

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
			next[key] = existing[key] ?? `${title} شماره ${i + 1}`;
		}
		setOrder((prev) => ({ ...prev, translationItemNames: next }));
	}, [count, order?.translationItem?.translationItemId]);

	// اگر مرحله‌ی جاری بر اثر تغییر توالی حذف شد، به نزدیک‌ترین مرحله‌ی معتبر برگرد
	useEffect(() => {
		if (!steps.includes(currentStep)) setCurrentStep("language");
	}, [steps, currentStep]);

	const currentIndex = Math.max(0, steps.indexOf(currentStep));
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

	const canGoNext = useMemo(() => {
		switch (currentStep) {
			case "selectItem":
				return !!order?.translationItem;
			case "naming":
				return docKeys.length > 0 && docKeys.every((k) => (names[k] ?? "").trim().length > 0);
			case "language":
				return !!order?.language && rates.attempted && !rates.loading;
			case "base":
				return docKeys.every((k) => Number(order?.baseRateCount?.[k]) > 0);
			case "upload":
				return docKeys.length > 0 && docKeys.every((k) => (order?.assetsByDoc?.[k]?.length ?? 0) > 0);
			case "passport":
				return (order?.passports?.length ?? 0) > 0;
			default:
				return true;
		}
	}, [currentStep, order, names, docKeys, rates.attempted, rates.loading]);

	const goNext = () => {
		if (!canGoNext || isLast) return;
		setCurrentStep(steps[currentIndex + 1]);
	};

	const goPrev = () => {
		if (isFirst) return;
		setCurrentStep(steps[currentIndex - 1]);
	};
	const resetSteps = () => {
		setCurrentStep("selectItem");
	};

	const ratesFailed =
		rates.attempted &&
		!rates.loading &&
		!rates.baseRate.result?.success &&
		!rates.dynamicRates.result?.success &&
		!rates.certifications.result?.success &&
		!rates.justiceInquiries.result?.success;

	const renderStep = () => {
		switch (currentStep) {
			case "selectItem":
				return <SelectItemStep onSelectItem={onSelectItem} />;
			case "naming":
				return <NamingStep />;
			case "language":
				return <LanguageStep rates={rates} onSelectLanguage={onSelectLanguage} />;
			case "base":
				return <BaseStep rates={rates} />;
			case "specials":
				return <SpecialsStep rates={rates} />;
			case "certifications":
				return <CertificationsStep rates={rates} />;
			case "inquiries":
				return <InquiriesStep rates={rates} />;
			case "embassy":
				return <EmbassyStep rates={rates} />;
			case "upload":
				return <UploadStep />;
			case "passport":
				return <PassportStep />;
			case "copies":
				return <CopiesStep />;
			case "scan":
				return <ScanStep rates={rates} />;
			case "checkout":
				return <CheckoutStep resetSteps={resetSteps} />;
			default:
				return null;
		}
	};

	if (initializing) {
		return (
			<div className="min-h-[100dvh] w-full flex items-center justify-center gap-2 text-sm text-neutral-500">
				<TabanLoading size={24} />
				در حال آماده‌سازی سفارش شما...
			</div>
		);
	}

	return (
		<div className="min-h-[100dvh] w-full bg-gradient-to-b from-secondary/[0.04] to-transparent py-8 lg:py-12 max-lg:px-4">
			<div className="container">
				<div className="max-w-5xl mx-auto flex flex-col gap-8">
					<div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur px-5 py-5 lg:px-8">
						<OrderStepper steps={steps} currentStep={currentStep} />
					</div>
					<div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 lg:p-10 min-h-[420px]">
						{currentStep === "language" && ratesFailed ? (
							<div className="flex flex-col gap-6">
								{renderStep()}
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
								{renderStep()}
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
	);
}
