"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconArrowLine } from "@/app/_components/icon/icons";
import { useApi } from "@/hooks/useApi";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { AddDocumentToCartPayload } from "@/types/cart.type";
import { useProfile } from "@/hooks/useProfile";
import { generateUUID } from "@/utils/string";
import { StepKey, slugToStep, stepToSlug } from "@/app/(withoutFooter)/new-order/_config/steps";
import { useOrderRates } from "@/app/(withoutFooter)/new-order/_hooks/useOrderRates";
import OrderStepper from "@/app/(withoutFooter)/new-order/_components/orderStepper/orderStepper";
import { EditFlowProvider } from "./editFlow.context";
import { EditFlowConfig, EditSource, EditState } from "./editFlow.type";
import { buildEditState } from "./_utils/buildEditState";
import { buildCalcPayload, buildUpdatePayload } from "./_utils/buildCalcPayload";

type EditFlowLayoutProps = {
	/** آیتم بارگذاری‌شده؛ تا زمان آماده‌شدن null است */
	source: EditSource | null;
	/** در حال بارگذاریِ اطلاعات اولیه */
	loading: boolean;
	/** المانِ خطای قابل‌تلاش‌مجدد (مثلا خطای دریافت سفارش) */
	loadError?: ReactNode | null;
	notFound: boolean;
	notFoundHref: string;
	notFoundLabel: string;
	config: EditFlowConfig;
	/** ارسال بروزرسانی؛ هر فلو endpoint خودش را می‌دهد */
	submit: (payload: AddDocumentToCartPayload) => void;
	submitLoading: boolean;
	children: ReactNode;
};

function FlowLoading() {
	return (
		<div className="min-h-[60vh] w-full flex items-center justify-center gap-2 text-sm text-neutral-500">
			<TabanLoading size={24} />
			در حال بارگذاری اطلاعات سفارش...
		</div>
	);
}

export default function EditFlowLayout({
	source,
	loading,
	loadError,
	notFound,
	notFoundHref,
	notFoundLabel,
	config,
	submit,
	submitLoading,
	children,
}: EditFlowLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { profile } = useProfile();
	const fallbackUploadScope = useMemo(() => generateUUID(), []);
	const uploadScope = profile?.userId || fallbackUploadScope;

	const [editState, setEditState] = useState<EditState | null>(null);
	const [wantEmbassyByDoc, setWantEmbassyByDoc] = useState<Record<string, boolean>>({});

	const rates = useOrderRates();
	const translationItem = useApi(async (id: string) => await TranslationEndpoints.getTranslationItem(id));

	const currentStep = useMemo<StepKey | null>(() => slugToStep(pathname.split("/").pop()), [pathname]);

	const goToStep = (key: StepKey, opts?: { replace?: boolean }) => {
		const url = `${config.stepBase}/${stepToSlug(key)}`;
		if (opts?.replace) router.replace(url);
		else router.push(url);
	};

	const builtRef = useRef(false);
	useEffect(() => {
		if (!source || builtRef.current) return;
		builtRef.current = true;
		setEditState(buildEditState(source));
	}, [source]);

	useEffect(() => {
		const itemId = editState?.translationItemId;
		const languageId = editState?.languageId;
		if (itemId && languageId) rates.fetchAll(itemId, languageId);
	}, [editState?.translationItemId, editState?.languageId]);

	useEffect(() => {
		if (editState?.translationItemId) translationItem.fetchData(editState.translationItemId);
	}, [editState?.translationItemId]);

	useEffect(() => {
		if (!editState) return;
		setWantEmbassyByDoc((prev) => {
			const next = { ...prev };
			Object.keys(editState.embassies).forEach((key) => {
				if (next[key] === undefined) next[key] = (editState.embassies[key]?.length ?? 0) > 0;
			});
			return next;
		});
	}, [editState]);

	// تغییر تمایل به تایید سفارت برای یک مدرک؛ با خاموش‌کردن، انتخاب‌های سفارتِ آن مدرک پاک می‌شود
	const toggleWantEmbassy = (docKey: string) => {
		const next = !wantEmbassyByDoc[docKey];
		setWantEmbassyByDoc((prev) => ({ ...prev, [docKey]: next }));
		if (!next) {
			setEditState((s) => (s ? { ...s, embassies: { ...s.embassies, [docKey]: [] } } : s));
		}
	};

	// انتخاب زبان: نرخ‌ها وابسته به زبان‌اند، پس انتخاب‌های وابسته به نرخ پاک می‌شوند (فایل‌ها/نسخه حفظ می‌شوند)
	const onSelectLanguage = (languageId: string, languageName: string) => {
		setEditState((prev) => {
			if (!prev || prev.languageId === languageId) return prev;
			return {
				...prev,
				languageId,
				languageName,
				baseRateCount: {},
				specialItems: {},
				mfaCertification: {},
				justiceCertification: {},
				justiceInquiries: {},
				selfInquiry: {},
				embassies: {},
			};
		});
		rates.reset();
	};

	// استعلام‌ها فقط وقتی در توالی می‌آیند که «مهر دادگستری» انتخاب شده باشد یا از قبل استعلامی ثبت شده باشد
	const showInquiries = useMemo(() => {
		if (!editState) return false;
		const keys = Object.keys(editState.translationItemNames);
		const hasJustice = keys.some((key) => !!editState.justiceCertification[key]);
		const hasRegistered = keys.some(
			(key) => (editState.justiceInquiries[key]?.length ?? 0) > 0 || !!editState.selfInquiry[key]
		);
		return hasJustice || hasRegistered;
	}, [editState]);

	// توالیِ داینامیکِ مراحل: دقیقا مثل فلوی ثبت سفارش، منهای مرحله‌ی «انتخاب مدرک»
	const steps = useMemo<StepKey[]>(() => {
		const base = rates.steps.filter((k) => k !== "selectItem");
		return showInquiries ? base : base.filter((k) => k !== "inquiries");
	}, [rates.steps, showInquiries]);

	// ورود از ریشه (بدون سگمنتِ مرحله): به مرحله‌ی اول ریدایرکت شود
	useEffect(() => {
		if (currentStep === null) goToStep("naming", { replace: true });
	}, [currentStep]);

	// اگر مرحله‌ی جاری بر اثر تغییر توالی حذف شد، به مرحله‌ی اول برگرد (پس از آماده‌شدن نرخ‌ها)
	const validityArmed = useRef(false);
	useEffect(() => {
		if (!validityArmed.current) {
			validityArmed.current = true;
			return;
		}
		if (!editState || currentStep === null) return;
		if (!rates.attempted || rates.loading) return;
		if (!steps.includes(currentStep)) goToStep("naming", { replace: true });
	}, [steps, currentStep, editState, rates.attempted, rates.loading]);

	const currentIndex = currentStep ? Math.max(0, steps.indexOf(currentStep)) : 0;
	const isFirst = currentIndex === 0;
	const isLast = currentStep === "checkout";

	const calcPayload = useMemo(() => (editState ? buildCalcPayload(editState) : null), [editState]);

	const canGoNext = useMemo(() => {
		if (!editState || !currentStep) return false;
		const names = editState.translationItemNames;
		const docKeys = Object.keys(names);
		switch (currentStep) {
			case "naming":
				return docKeys.length > 0 && docKeys.every((k) => (names[k] ?? "").trim().length > 0);
			case "language":
				return !!editState.languageId && rates.attempted && !rates.loading;
			case "base":
				return docKeys.every((k) => Number(editState.baseRateCount[k]) > 0);
			case "embassy":
				return docKeys.every((k) => {
					const allowed = !!editState.justiceCertification[k] && !!editState.mfaCertification[k];
					if (allowed && wantEmbassyByDoc[k]) return (editState.embassies[k]?.length ?? 0) > 0;
					return true;
				});
			default:
				return true;
		}
	}, [editState, currentStep, wantEmbassyByDoc, rates.attempted, rates.loading]);

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

	const onSubmit = () => {
		if (!editState) return;
		const payload = buildUpdatePayload(editState);
		if (payload) submit(payload);
	};

	if (notFound) {
		return (
			<div className="flex flex-col items-center gap-4 py-16">
				<div className="text-neutral-500 text-sm">{notFoundLabel}</div>
				<Link href={notFoundHref}>
					<TabanButton>بازگشت</TabanButton>
				</Link>
			</div>
		);
	}

	if (loadError) {
		return <div className="flex justify-center mt-4">{loadError}</div>;
	}

	if (currentStep === null || !editState || loading) {
		return <FlowLoading />;
	}

	const uploadDescription = (translationItem.result?.success ? translationItem.result.data?.data?.uploadDescription ?? "" : "").trim();
	const namePlaceholder = (translationItem.result?.success ? translationItem.result.data?.data?.namePlaceholder ?? "" : "").trim() || undefined;

	return (
		<EditFlowProvider
			value={{
				editState,
				setEditState,
				rates,
				currentStep,
				summaryVariant: config.summaryVariant,
				uploadScope,
				uploadDescription,
				namePlaceholder,
				wantEmbassyByDoc,
				toggleWantEmbassy,
				onSelectLanguage,
				calcPayload,
			}}
		>
			<div className="w-full bg-gradient-to-b from-secondary/[0.04] to-transparent py-8 lg:py-10 max-lg:px-4">
				<div className="max-w-5xl mx-auto flex flex-col gap-8">
					<div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur px-5 py-5 lg:px-8">
						<div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-dashed border-neutral-200">
							<div className="peyda font-bold text-primary">{config.headerTitle}</div>
							<div className="text-xs text-neutral-500">
								{editState.translationItemTitle} · {editState.languageName}
							</div>
						</div>
						<OrderStepper steps={steps} currentStep={currentStep} />
					</div>

					<div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 lg:p-10 min-h-[420px]">
						<motion.div
							key={currentStep}
							initial={{ opacity: 0, x: 16 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
						>
							{children}
						</motion.div>
					</div>

					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<Link href={config.cancelHref}>
								<TabanButton variant="text">انصراف</TabanButton>
							</Link>
							{!isFirst && (
								<TabanButton variant="bordered" onClick={goPrev}>
									مرحله قبلی
								</TabanButton>
							)}
						</div>
						{!isLast ? (
							<TabanButton onClick={goNext} icon={<IconArrowLine />} disabled={!canGoNext}>
								مرحله بعدی
							</TabanButton>
						) : (
							<TabanButton onClick={onSubmit} isLoading={submitLoading} disabled={submitLoading}>
								{config.submitLabel}
							</TabanButton>
						)}
					</div>
				</div>
			</div>
		</EditFlowProvider>
	);
}
