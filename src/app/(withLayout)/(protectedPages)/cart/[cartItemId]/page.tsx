"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cart";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { useApi } from "@/hooks/useApi";
import { AddDocumentToCartPayload, CartItem } from "@/types/cart.type";
import { RateCalculationDocumentInput, RateCalculationRequest } from "@/types/rateCalculation.type";
import { RateFilters } from "@/types/rateFilters.type";
import { toCurrency, assetFolderName, generateUUID } from "@/utils/string";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { useProfiletore } from "@/stores/profile";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import UploadBox from "@/app/_components/common/uploadBox/uploadBox";
import DocumentDescriptionField from "@/app/_components/common/documentDescriptionField/documentDescriptionField";
import PassportPicker from "@/app/_components/common/passportPicker/passportPicker";
import DeliverySection from "@/app/_components/common/deliverySection/deliverySection";
import { useNotificationStore } from "@/stores/notification.store";
import {
	IconArrowLine,
	IconCopy,
	IconDocument,
	IconEmbassy,
	IconInfo,
	IconInquiry,
	IconJustice,
	IconMfa,
	IconRequired,
	IconStar,
	IconTick,
	IconTranslate,
	IconUpload,
} from "@/app/_components/icon/icons";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { StepKey } from "@/app/(withoutFooter)/new-order/_config/steps";
import OrderStepper from "@/app/(withoutFooter)/new-order/_components/orderStepper/orderStepper";
import StepHeader from "@/app/(withoutFooter)/new-order/_components/stepHeader/stepHeader";
import SelectCard from "@/app/(withoutFooter)/new-order/_components/selectCard/selectCard";
import DocumentSection from "@/app/(withoutFooter)/new-order/_components/documentSection/documentSection";
import CardsSkeleton from "@/app/(withoutFooter)/new-order/_components/cardsSkeleton/cardsSkeleton";

const TOTAL_STEPS = 12;

// نگاشت هر مرحله‌ی عددیِ فلوی ویرایش به StepKey استپرِ فلوی ثبت سفارش (بدون مرحله‌ی انتخاب مدرک)
const EDIT_STEP_KEYS: StepKey[] = [
	"naming",
	"language",
	"base",
	"specials",
	"certifications",
	"inquiries",
	"embassy",
	"upload",
	"passport",
	"copies",
	"scan",
	"checkout",
];

const SummaryRow = ({ label, value, bold }: { label: string; value: number; bold?: boolean }) => (
	<div className="flex items-center justify-between">
		<div className={`text-sm ${bold ? "peyda font-bold text-primary" : "text-neutral-500"}`}>{label}</div>
		<div className={`flex items-center gap-1 ${bold ? "peyda font-bold text-lg text-primary" : "font-semibold"}`}>
			{toCurrency(value)}
			<span className="text-xs font-normal text-neutral-400">تومان</span>
		</div>
	</div>
);

type EditState = {
	translationItemId: string;
	translationItemTitle: string;
	languageId: string;
	languageName: string;
	translationItemNames: Record<string, string>;
	baseRateCount: Record<string, string>;
	specialItems: Record<string, Record<string, string>>;
	mfaCertification: Record<string, string | null>;
	justiceCertification: Record<string, string | null>;
	justiceInquiries: Record<string, string[]>;
	selfInquiry: Record<string, boolean>;
	embassies: Record<string, string[]>;
	copyCount: Record<string, string>;
	scanRateIdByDoc: Record<string, string | null>;
	passports: string[];
	assetsByDoc: Record<string, string[]>;
	descriptionByDoc: Record<string, string>;
	desiredDeliveryDate: string | null;
	isOfficial: boolean;
};

function buildInitialState(item: CartItem): EditState {
	const { payload, breakdown } = item;
	const translationItemNames: Record<string, string> = {};
	const baseRateCount: Record<string, string> = {};
	const specialItems: Record<string, Record<string, string>> = {};
	const mfaCertification: Record<string, string | null> = {};
	const justiceCertification: Record<string, string | null> = {};
	const justiceInquiries: Record<string, string[]> = {};
	const selfInquiry: Record<string, boolean> = {};
	const embassies: Record<string, string[]> = {};
	const copyCount: Record<string, string> = {};
	const scanRateIdByDoc: Record<string, string | null> = {};
	const assetsByDoc: Record<string, string[]> = {};
	const descriptionByDoc: Record<string, string> = {};

	payload.documents.forEach((doc) => {
		translationItemNames[doc.documentKey] = doc.title;
		baseRateCount[doc.documentKey] = doc.baseRateCount.toString();
		specialItems[doc.documentKey] = {};
		doc.specials.forEach((s) => {
			specialItems[doc.documentKey][s.dynamicRateId] = s.count.toString();
		});
		mfaCertification[doc.documentKey] = doc.mfaCertificationRateId ?? null;
		justiceCertification[doc.documentKey] = doc.justiceCertificationRateId ?? null;
		justiceInquiries[doc.documentKey] = doc.justiceInquiryRateIds ?? [];
		selfInquiry[doc.documentKey] = doc.selfInquiry ?? false;
		embassies[doc.documentKey] = doc.embassyRateIds ?? [];
		copyCount[doc.documentKey] = (doc.copyCount ?? 1).toString();
		scanRateIdByDoc[doc.documentKey] = doc.scanRateId ?? null;
		assetsByDoc[doc.documentKey] = doc.assets ?? [];
		descriptionByDoc[doc.documentKey] = doc.description ?? "";
	});

	// انتقال فایل‌های قدیمیِ سطح‌بالا به اولین مدرک (سفارش‌های پیش از جداسازی per-document)
	const firstDocKey = payload.documents[0]?.documentKey;
	if (
		firstDocKey &&
		!payload.documents.some((d) => (assetsByDoc[d.documentKey]?.length ?? 0) > 0) &&
		(payload.assets?.length ?? 0) > 0
	) {
		assetsByDoc[firstDocKey] = payload.assets ?? [];
	}

	return {
		translationItemId: payload.translationItemId,
		translationItemTitle: breakdown.translationItemTitle,
		languageId: payload.languageId,
		languageName: breakdown.languageName,
		translationItemNames,
		baseRateCount,
		specialItems,
		mfaCertification,
		justiceCertification,
		justiceInquiries,
		selfInquiry,
		embassies,
		copyCount,
		scanRateIdByDoc,
		passports: payload.passports ?? [],
		assetsByDoc,
		descriptionByDoc,
		desiredDeliveryDate: payload.desiredDeliveryDate ?? null,
		isOfficial: payload.isOfficial !== false,
	};
}

export default function CartEditPage() {
	const params = useParams();
	const router = useRouter();
	const cartItemId = params?.cartItemId as string;
	const { cart, setCart } = useCartStore();
	const showNotification = useNotificationStore((s) => s.showNotification);
	const profile = useProfiletore((s) => s.profile);
	// ریشه‌ی پوشه‌ی آپلود: شناسه‌ی کاربر واردشده (در این صفحه همیشه موجود است)
	const fallbackUploadScope = useMemo(() => generateUUID(), []);
	const uploadScope = profile?.userId || fallbackUploadScope;

	const [step, setStep] = useState(1);
	const [editState, setEditState] = useState<EditState | null>(null);
	// آیا کاربر می‌خواهد این مدرک به تایید سفارت برسد؟ (تیکِ نمایشیِ مرحله‌ی تایید سفارت)
	const [wantEmbassyByDoc, setWantEmbassyByDoc] = useState<Record<string, boolean>>({});

	const getCart = useApi(async () => await CartEndpoints.getCart());
	const languages = useApi(async () => await TranslationEndpoints.getLanguages(), true);
	const baseRate = useApi(async (filters: RateFilters) => await TranslationEndpoints.getBaseRate(filters));
	const dynamicRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getDynamicRates(filters));
	const certificationRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getCertificationRates(filters));
	const justiceInquiryRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getJusticeInquiriesRates(filters));
	const embassyRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getEmbassyRates(filters));
	const scanRates = useApi(async (filters: { translationItemId?: string } | null) => await TranslationEndpoints.getScanRates(filters));
	const translationItem = useApi(async (id: string) => await TranslationEndpoints.getTranslationItem(id));
	const calculation = useApi(async (payload: RateCalculationRequest) => await TranslationEndpoints.calculateRate(payload));
	const updateItem = useApi(async (payload: AddDocumentToCartPayload) => await CartEndpoints.updateCartItem(cartItemId, payload));

	// Initialize edit state from cart store or fetch from API
	useEffect(() => {
		const cartItem = cart?.items?.find((it) => it.cartItemId === cartItemId);
		if (cartItem) {
			setEditState(buildInitialState(cartItem));
		} else {
			getCart.fetchData();
		}
		languages.fetchData();
	}, []);

	useEffect(() => {
		if (getCart.result?.success) {
			const fetchedCart = getCart.result.data?.data ?? null;
			setCart(fetchedCart);
			const found = fetchedCart?.items?.find((it) => it.cartItemId === cartItemId);
			if (found) setEditState(buildInitialState(found));
		}
	}, [getCart.result]);

	// واکشی توضیحات آپلود مدرک (که ادمین نوشته) برای نمایش در مرحله‌ی آپلود
	useEffect(() => {
		if (editState?.translationItemId) translationItem.fetchData(editState.translationItemId);
	}, [editState?.translationItemId]);

	// مقداردهی اولیه‌ی تیکِ «تایید سفارت»: مدارکی که از قبل سفارت انتخاب‌شده دارند، باز نمایش داده می‌شوند
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

	// واکشیِ نرخ‌ها به‌محض مشخص‌شدن مدرک و زبان (و با هر تغییر زبان) تا نتیجه‌ی نرخ پایه
	// پیش از رسیدن کاربر به مرحله‌ی نرخ پایه آماده باشد و بتوان در صورت نبودِ نرخ، آن مرحله را حذف کرد.
	const lastRatesKey = useRef<string>("");
	useEffect(() => {
		if (!editState) return;
		const { translationItemId, languageId } = editState;
		if (!translationItemId || !languageId) return;
		const key = `${translationItemId}-${languageId}`;
		if (key === lastRatesKey.current) return;
		lastRatesKey.current = key;
		const filters: RateFilters = { translationItemId, languageId };
		baseRate.fetchData(filters);
		dynamicRates.fetchData(filters);
		certificationRates.fetchData(filters);
		justiceInquiryRates.fetchData(filters);
		embassyRates.fetchData(filters);
		scanRates.fetchData({ translationItemId });
	}, [editState?.translationItemId, editState?.languageId]);

	// Update cart item result handler
	useEffect(() => {
		if (!updateItem.result) return;
		if (updateItem.result.success) {
			setCart(updateItem.result.data?.data ?? null);
			showNotification({ type: "success", message: "سفارش با موفقیت بروزرسانی شد" });
			router.push("/cart");
		} else {
			showNotification({
				type: "error",
				message: updateItem.result.description ?? "بروزرسانی سفارش با خطا مواجه شد",
			});
		}
	}, [updateItem.result]);

	// Build calculation payload from current edit state
	const calcPayload = useMemo<RateCalculationRequest | null>(() => {
		if (!editState) return null;
		const documentKeys = Object.keys(editState.translationItemNames);
		if (documentKeys.length === 0) return null;
		const documents: RateCalculationDocumentInput[] = documentKeys.map((key) => ({
			documentKey: key,
			title: editState.translationItemNames[key],
			baseRateCount: Number(editState.baseRateCount[key] ?? 1) || 1,
			specials: Object.entries(editState.specialItems[key] ?? {})
				.filter(([, cnt]) => Number(cnt) > 0)
				.map(([dynamicRateId, cnt]) => ({ dynamicRateId, count: Number(cnt) })),
			copyCount: Number(editState.copyCount[key] ?? 1) || 1,
			assets: editState.assetsByDoc[key] ?? [],
			mfaCertificationRateId: editState.mfaCertification[key] ?? null,
			justiceCertificationRateId: editState.justiceCertification[key] ?? null,
			justiceInquiryRateIds:
				editState.justiceCertification[key] && !editState.selfInquiry[key] ? (editState.justiceInquiries[key] ?? []) : [],
			embassyRateIds:
				editState.justiceCertification[key] && editState.mfaCertification[key] ? editState.embassies[key] ?? [] : [],
			selfInquiry: !!editState.selfInquiry[key],
			scanRateId: editState.scanRateIdByDoc[key] ?? null,
			description: editState.descriptionByDoc[key]?.trim() || undefined,
		}));
		return { translationItemId: editState.translationItemId, languageId: editState.languageId, documents, isOfficial: editState.isOfficial };
	}, [editState]);

	// Trigger calculation on summary step
	useEffect(() => {
		if (step === 12 && calcPayload) {
			calculation.fetchData(calcPayload);
		}
	}, [step]);

	// مرحله‌ی نرخ پایه (مرحله ۳) فقط وقتی نمایش داده می‌شود که برای این ترکیب مدرک/زبان نرخ پایه‌ای
	// تعریف شده باشد؛ در غیر این صورت مثل فلوی ثبت سفارش این مرحله از فلو حذف می‌شود.
	// معیار نمایش دقیقاً مثل فلوی ثبت سفارش: وجودِ «تایتل» نرخ پایه (نه صرفِ وجود ردیف نرخ)
	const hasBaseRate = !!(baseRate.result?.success && baseRate.result.data?.data?.[0]?.title);
	const skipBaseStep = !baseRate.loading && !!baseRate.result && !hasBaseRate;

	// مرحله‌ی استعلام (مرحله ۶) فقط وقتی نمایش داده می‌شود که برای مدرکی «مهر دادگستری» انتخاب شده باشد،
	// یا از قبل استعلامی (یا «خودم می‌گیرم») برای مدرکی ثبت شده باشد؛ در غیر این صورت از فلو حذف می‌شود.
	const skipInquiriesStep = useMemo(() => {
		if (!editState) return false;
		const keys = Object.keys(editState.translationItemNames);
		const hasJustice = keys.some((key) => !!editState.justiceCertification[key]);
		const hasInquiries = keys.some((key) => (editState.justiceInquiries[key]?.length ?? 0) > 0 || !!editState.selfInquiry[key]);
		return !hasJustice && !hasInquiries;
	}, [editState]);

	// اگر با وجود آماده‌شدنِ نرخ‌ها همچنان روی مرحله‌ی نرخ پایه بمانیم ولی نرخی نباشد، رد شو
	useEffect(() => {
		if (step === 3 && skipBaseStep) setStep(4);
	}, [step, skipBaseStep]);

	const goNext = () =>
		setStep((s) => {
			let next = Math.min(s + 1, TOTAL_STEPS);
			if (next === 3 && skipBaseStep) next = 4;
			if (next === 6 && skipInquiriesStep) next = 7;
			return next;
		});

	const goPrev = () =>
		setStep((s) => {
			let prev = Math.max(s - 1, 1);
			if (prev === 6 && skipInquiriesStep) prev = 5;
			if (prev === 3 && skipBaseStep) prev = 2;
			return prev;
		});

	const submitUpdate = () => {
		if (!calcPayload || !editState) return;
		updateItem.fetchData({
			...calcPayload,
			passports: editState.passports,
			assets: Object.values(editState.assetsByDoc).flat(),
			desiredDeliveryDate: editState.desiredDeliveryDate,
			isOfficial: editState.isOfficial,
		});
	};

	if (!editState && (getCart.loading || !getCart.result)) {
		return (
			<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
				<TabanLoading size={24} />
				در حال بارگذاری اطلاعات سفارش...
			</div>
		);
	}

	if (!editState) {
		return (
			<div className="flex flex-col items-center gap-4 py-16">
				<div className="text-neutral-500 text-sm">سفارش مورد نظر یافت نشد</div>
				<Link href="/cart">
					<TabanButton>بازگشت به سبد خرید</TabanButton>
				</Link>
			</div>
		);
	}

	const documentKeys = Object.keys(editState.translationItemNames);
	const uploadDescription = (translationItem.result?.success ? translationItem.result.data?.data?.uploadDescription ?? "" : "").trim();
	// پلیس‌هولدرِ نام مدرک که ادمین برای این مدرک تعریف کرده است
	const namePlaceholder = (translationItem.result?.success ? translationItem.result.data?.data?.namePlaceholder ?? "" : "").trim() || undefined;

	// اگر بیش از یک مدرک باشد، وارد کردن نام هر مدرک اجباری است (تک‌مدرک با مقدار پیش‌فرض قابل‌ویرایش است)
	const namingValid = documentKeys.length <= 1 || documentKeys.every((key) => (editState.translationItemNames[key] ?? "").trim().length > 0);

	// اگر برای مدرکی تیک «می‌خواهم به تایید سفارت برسد» فعال است، انتخابِ حداقل یک سفارت اجباری است
	const embassyStepValid = documentKeys.every((key) => {
		const allowed = !!editState.justiceCertification[key] && !!editState.mfaCertification[key];
		if (allowed && wantEmbassyByDoc[key]) return (editState.embassies[key]?.length ?? 0) > 0;
		return true;
	});
	const canProceed = (step !== 1 || namingValid) && (step !== 7 || embassyStepValid);

	// مرحله‌ی جاری و توالیِ فعالِ استپر (مراحلِ حذف‌شده از استپر هم کنار می‌روند)
	const currentStepKey = EDIT_STEP_KEYS[step - 1];
	const activeStepKeys = EDIT_STEP_KEYS.filter(
		(k) => !(k === "base" && skipBaseStep) && !(k === "inquiries" && skipInquiriesStep)
	);

	return (
		<div className="w-full bg-gradient-to-b from-secondary/[0.04] to-transparent py-8 lg:py-10 max-lg:px-4">
			<div className="max-w-5xl mx-auto flex flex-col gap-8">
				<div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur px-5 py-5 lg:px-8">
					<div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-dashed border-neutral-200">
						<div className="peyda font-bold text-primary">ویرایش سفارش ترجمه</div>
						<div className="text-xs text-neutral-500">
							{editState.translationItemTitle} · {editState.languageName}
						</div>
					</div>
					<OrderStepper steps={activeStepKeys} currentStep={currentStepKey} />
				</div>

				<div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 lg:p-10 min-h-[420px]">
					<motion.div
						key={step}
						initial={{ opacity: 0, x: 16 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
					>
						{/* Step 1: Document naming */}
						{step === 1 && (
							<div className="flex flex-col gap-8">
								<StepHeader
									title="مدارک خود را نام‌گذاری کنید"
									subtitle="با یک نام دلخواه، تشخیص مدارک در مراحل بعدی برای شما ساده‌تر می‌شود"
								/>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7 max-w-3xl mx-auto w-full">
									{documentKeys.map((key, index) => {
										const value = editState.translationItemNames[key] ?? "";
										const hasError = documentKeys.length > 1 && !value.trim();
										return (
											<motion.div
												key={key}
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.05 }}
												className="flex flex-col gap-1"
											>
												<div>{`نام مدرک شماره ${index + 1}`}</div>
												<TabanInput
													value={value}
													name={key}
													placeholder={namePlaceholder}
													leadingIcon={<IconDocument width={20} height={20} className="fill-secondary stroke-0" />}
													setValue={(val: string) =>
														setEditState((prev) =>
															prev ? { ...prev, translationItemNames: { ...prev.translationItemNames, [key]: val ?? "" } } : prev
														)
													}
													isHandleError
													hasError={hasError}
													errorText={hasError ? "وارد کردن نام مدرک الزامی است" : ""}
												/>
											</motion.div>
										);
									})}
								</div>
								<div className="max-w-3xl mx-auto w-full text-sm bg-secondary/10 border border-secondary/20 text-primary p-3 rounded-xl flex items-center gap-2">
									<IconTranslate stroke="#1a3047" strokeWidth={0} className="fill-primary w-4 h-4 shrink-0" />
									<span>
										نوع مدرک: <span className="font-semibold">{editState.translationItemTitle}</span>
									</span>
								</div>
							</div>
						)}

						{/* Step 2: Language */}
						{step === 2 && (
							<div className="flex flex-col gap-8">
								<StepHeader title="زبان ترجمه را انتخاب کنید" subtitle="مدارک شما به زبان انتخابی ترجمه خواهد شد" />
								{languages.loading && !languages.result ? (
									<CardsSkeleton count={6} />
								) : languages.result?.success && (languages.result.data?.data?.length ?? 0) > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
										{languages.result.data?.data?.map((lang, index) => (
											<motion.div
												key={lang.languageId}
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
											>
												<SelectCard
													selected={editState.languageId === lang.languageId}
													onClick={() =>
														setEditState((prev) =>
															prev ? { ...prev, languageId: lang.languageId, languageName: lang.languageName } : prev
														)
													}
													icon={<IconTranslate width={26} height={26} className="fill-current stroke-0" />}
													title={lang.languageName}
													indicator="none"
													trailing={
														<div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
															<Image width={28} height={28} alt={lang.languageName} src={`/images/languages/${lang.languageCode}.png`} />
														</div>
													}
												/>
											</motion.div>
										))}
									</div>
								) : languages.result && !languages.result.success && isRetryAble(languages.result.code) ? (
									<ErrorComponent executeFunction={() => languages.fetchData()} ticketAble errorText="دریافت لیست زبان‌ها با خطا مواجه شد." />
								) : (
									<div className="text-center text-sm text-neutral-400 py-10">داده‌ای موجود نیست</div>
								)}
							</div>
						)}

						{/* Step 3: Base rates */}
						{step === 3 && (
							<div className="flex flex-col gap-8">
								<StepHeader
									title={`${baseRate.result?.data?.data?.[0]?.title ?? "نرخ پایه"} مدارک`}
									subtitle="تعداد پایه‌ی هر مدرک را برای محاسبه‌ی دقیق نرخ ترجمه وارد کنید"
								/>
								{baseRate.loading && !baseRate.result ? (
									<CardsSkeleton count={4} columns={2} />
								) : baseRate.result?.success && (baseRate.result.data?.data?.length ?? 0) > 0 ? (
									<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
										{documentKeys.map((key, index) => (
											<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
												<div className="flex flex-col gap-2">
													<span className="text-sm text-neutral-500">{baseRate.result?.data?.data?.[0]?.title ?? "نرخ پایه"}</span>
													<div className="w-full sm:w-72">
														<TabanInput
															isNumber
															type="number"
															value={editState.baseRateCount[key] ?? ""}
															setValue={(val: string) =>
																setEditState((prev) =>
																	prev ? { ...prev, baseRateCount: { ...prev.baseRateCount, [key]: val ?? "" } } : prev
																)
															}
															name={key}
														/>
													</div>
												</div>
											</DocumentSection>
										))}
									</div>
								) : (
									<div className="text-sm text-neutral-400 py-4 text-center">نرخ پایه‌ای برای این ترکیب تعریف نشده است</div>
								)}
							</div>
						)}

						{/* Step 4: Special items */}
						{step === 4 && (
							<div className="flex flex-col gap-8">
								<StepHeader title="موارد خاص ترجمه" subtitle="در صورت نیاز، تعداد موارد خاص هر مدرک را مشخص کنید (اختیاری)" />
								{dynamicRates.loading && !dynamicRates.result ? (
									<CardsSkeleton count={4} columns={2} />
								) : dynamicRates.result?.success && (dynamicRates.result.data?.data?.length ?? 0) > 0 ? (
									<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
										{documentKeys.map((key, index) => (
											<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
													{dynamicRates.result?.data?.data?.map((rate) => (
														<div key={rate.dynamicRateId} className="flex flex-col gap-2">
															<span className="peyda font-semibold text-sm text-neutral-600">{rate.label}</span>
															<TabanInput
																isNumber
																type="number"
																value={editState.specialItems[key]?.[rate.dynamicRateId] ?? ""}
																onChange={(e) =>
																	setEditState((prev) => {
																		if (!prev) return prev;
																		return {
																			...prev,
																			specialItems: {
																				...prev.specialItems,
																				[key]: { ...prev.specialItems[key], [rate.dynamicRateId]: e.target.value },
																			},
																		};
																	})
																}
																name={rate.dynamicRateId}
															/>
														</div>
													))}
												</div>
											</DocumentSection>
										))}
									</div>
								) : (
									<div className="text-sm text-neutral-400 py-4 text-center">موارد خاصی برای این ترکیب تعریف نشده است</div>
								)}
							</div>
						)}

						{/* Step 5: Certifications */}
						{step === 5 && (
							<div className="flex flex-col gap-8">
								<StepHeader title="مهر و تاییدات ترجمه" subtitle="در صورت نیاز، مهرهای رسمی هر مدرک را انتخاب کنید (اختیاری)" />
								{certificationRates.loading && !certificationRates.result ? (
									<CardsSkeleton count={4} columns={2} />
								) : certificationRates.result?.success && (certificationRates.result.data?.data?.length ?? 0) > 0 ? (
									<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
										{documentKeys.map((key, index) => {
											const rateId = certificationRates.result?.data?.data?.[0]?.certificationRateId ?? null;
											return (
												<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
														<SelectCard
															selected={!!editState.justiceCertification[key]}
															onClick={() =>
																setEditState((prev) => {
																	if (!prev) return prev;
																	const current = prev.justiceCertification[key];
																	if (current) {
																		// حذف دادگستری: امور خارجه هم برداشته می‌شود و استعلام/سفارتِ این مدرک پاک می‌گردد
																		return {
																			...prev,
																			justiceCertification: { ...prev.justiceCertification, [key]: null },
																			mfaCertification: { ...prev.mfaCertification, [key]: null },
																			justiceInquiries: { ...prev.justiceInquiries, [key]: [] },
																			selfInquiry: { ...prev.selfInquiry, [key]: false },
																			embassies: { ...prev.embassies, [key]: [] },
																		};
																	}
																	return { ...prev, justiceCertification: { ...prev.justiceCertification, [key]: rateId } };
																})
															}
															icon={<IconJustice width={36} height={36} viewBox="0 0 48 48" className="fill-current stroke-0" />}
															title="مهر دادگستری"
															description={
																editState.mfaCertification[key]
																	? "تایید دادگستری، پیشنیاز تایید ترجمه توسط وزارت امور خارجه می باشد"
																	: "تایید رسمی ترجمه توسط قوه قضاییه"
															}
														/>
														<SelectCard
															selected={!!editState.mfaCertification[key]}
															onClick={() =>
																setEditState((prev) => {
																	if (!prev) return prev;
																	const current = prev.mfaCertification[key];
																	if (current) {
																		// حذف امور خارجه: تایید سفارتِ این مدرک هم پاک می‌شود
																		return { ...prev, mfaCertification: { ...prev.mfaCertification, [key]: null }, embassies: { ...prev.embassies, [key]: [] } };
																	}
																	// انتخاب مهر امور خارجه، مهر دادگستری را هم اجباراً فعال می‌کند
																	return {
																		...prev,
																		mfaCertification: { ...prev.mfaCertification, [key]: rateId },
																		justiceCertification: { ...prev.justiceCertification, [key]: prev.justiceCertification[key] ?? rateId },
																	};
																})
															}
															icon={<IconMfa width={32} height={32} className="stroke-current fill-none" />}
															title="مهر وزارت امور خارجه"
															description="تایید رسمی ترجمه توسط وزارت امور خارجه"
														/>
													</div>
												</DocumentSection>
											);
										})}

										<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-2.5">
											<IconInfo className="stroke-amber-600 w-5 h-5 shrink-0 mt-0.5" />
											<span className="text-sm leading-7 text-amber-700">
												لازم به ذکر است که جهت اخذ تاییدات، ارائه‌ی اصل مدارک به ارگان‌های مربوطه الزامی است.
											</span>
										</div>
									</div>
								) : (
									<div className="text-sm text-neutral-400 py-4 text-center">تاییداتی برای این ترکیب تعریف نشده است</div>
								)}
							</div>
						)}

						{/* Step 6: Justice inquiries */}
						{step === 6 && (
							<div className="flex flex-col gap-8">
								<StepHeader title="استعلام‌های ترجمه" subtitle="در صورت نیاز به استعلام خاص، آن‌ها را برای هر مدرک انتخاب کنید (اختیاری)" />
								{justiceInquiryRates.loading && !justiceInquiryRates.result ? (
									<CardsSkeleton count={4} columns={2} />
								) : justiceInquiryRates.result?.success && (justiceInquiryRates.result.data?.data?.length ?? 0) > 0 ? (
									<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
										{documentKeys.filter((key) => !!editState.justiceCertification[key]).length === 0 ? (
											<div className="flex items-center gap-2.5 bg-secondary/5 border border-secondary/30 rounded-2xl px-4 py-4">
												<IconJustice width={26} height={26} viewBox="0 0 48 48" className="fill-secondary stroke-0 shrink-0" />
												<span className="text-sm leading-7 text-primary peyda font-semibold">
													استعلام تنها برای مدارکی قابل انتخاب است که «مهر دادگستری» دارند. در صورت نیاز، در مرحله‌ی تاییدات مهر دادگستری را فعال کنید.
												</span>
											</div>
										) : (
											documentKeys
												.filter((key) => !!editState.justiceCertification[key])
												.map((key, index) => {
													const selfInq = !!editState.selfInquiry[key];
													return (
														<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
															<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
																{justiceInquiryRates.result?.data?.data?.map((inquiry) => {
																	const isSelected = (editState.justiceInquiries[key] ?? []).includes(inquiry.justiceInquiryRateId);
																	return (
																		<SelectCard
																			key={inquiry.justiceInquiryRateId}
																			selected={isSelected}
																			onClick={() =>
																				setEditState((prev) => {
																					if (!prev) return prev;
																					const current = prev.justiceInquiries[key] ?? [];
																					const updated = isSelected
																						? current.filter((id) => id !== inquiry.justiceInquiryRateId)
																						: [...current, inquiry.justiceInquiryRateId];
																					// با انتخاب استعلام از لیست، «خودم می‌گیرم» همان مدرک غیرفعال و پاک می‌شود
																					return { ...prev, justiceInquiries: { ...prev.justiceInquiries, [key]: updated }, selfInquiry: { ...prev.selfInquiry, [key]: false } };
																				})
																			}
																			icon={<IconInquiry width={34} height={34} viewBox="0 0 1024 1024" className="fill-current stroke-0" />}
																			title={inquiry.justiceInquiryName}
																		/>
																	);
																})}
															</div>

															<div className="mt-4 pt-4 border-t border-dashed border-neutral-200">
																<button
																	type="button"
																	onClick={() =>
																		setEditState((prev) => {
																			if (!prev) return prev;
																			const next = !prev.selfInquiry[key];
																			const justiceInquiries = next ? { ...prev.justiceInquiries, [key]: [] } : prev.justiceInquiries;
																			return { ...prev, selfInquiry: { ...prev.selfInquiry, [key]: next }, justiceInquiries };
																		})
																	}
																	className={`flex items-center gap-2.5 w-full text-right rounded-xl border px-4 py-3 duration-150 ${
																		selfInq ? "border-secondary bg-secondary/5" : "border-neutral-200 hover:border-secondary/40"
																	}`}
																>
																	<span
																		className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
																			selfInq ? "bg-secondary border-secondary" : "border-neutral-300"
																		}`}
																	>
																		{selfInq && <IconTick className="stroke-white w-4 h-4" strokeWidth={3.5} />}
																	</span>
																	<span className="text-sm font-medium text-primary">استعلام‌های این مدرک را خودم تهیه می‌کنم</span>
																</button>
																{selfInq && (
																	<div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 flex items-start gap-2.5">
																		<IconInfo className="stroke-sky-600 w-5 h-5 shrink-0 mt-0.5" />
																		<span className="text-xs leading-6 text-sky-700">
																			می‌توانید بعداً در پنل کاربری، در بخش جزئیات سفارش، نتیجه‌ی استعلام را برای ما آپلود کنید. کارشناسان ما در این زمینه شما را راهنمایی می‌کنند.
																		</span>
																	</div>
																)}
															</div>
														</DocumentSection>
													);
												})
										)}
									</div>
								) : (
									<div className="text-sm text-neutral-400 py-4 text-center">استعلامی برای این ترکیب تعریف نشده است</div>
								)}
							</div>
						)}

						{/* Step 7: Embassy approvals */}
						{step === 7 && (
							<div className="flex flex-col gap-8">
								<StepHeader title="تایید سفارت" subtitle="در صورت نیاز به تایید سفارت، سفارت‌های مربوط به هر مدرک را انتخاب کنید (اختیاری)" />
								{!embassyStepValid && (
									<span className="text-xs text-red-500 text-center">
										برای مدارکی که تیک «تایید سفارت» را زده‌اید، انتخابِ حداقل یک سفارت الزامی است
									</span>
								)}
								{embassyRates.loading && !embassyRates.result ? (
									<CardsSkeleton count={4} columns={2} />
								) : embassyRates.result?.success && (embassyRates.result.data?.data?.length ?? 0) > 0 ? (
									<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
										{documentKeys.map((key, index) => {
											const allowed = !!editState.justiceCertification[key] && !!editState.mfaCertification[key];
											const want = !!wantEmbassyByDoc[key];
											const hasSelection = (editState.embassies[key]?.length ?? 0) > 0;
											return (
												<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
													{!allowed ? (
														<div className="flex items-center gap-2.5 bg-secondary/5 border border-secondary/30 rounded-xl px-4 py-3">
															<IconEmbassy viewBox="0 0 50 64" width={24} height={24} className="stroke-secondary stroke-2 shrink-0" />
															<span className="text-xs leading-6 text-primary peyda font-semibold">
																برای تایید سفارت این مدرک، ابتدا «مهر دادگستری» و «مهر وزارت امور خارجه» را در مرحله‌ی تاییدات فعال کنید
															</span>
														</div>
													) : (
														<div className="flex flex-col gap-4">
															{/* تیکِ تمایل: تا انتخاب نشود، سفارت‌ها نمایش داده نمی‌شوند */}
															<button
																type="button"
																onClick={() => toggleWantEmbassy(key)}
																className={`flex items-center gap-2.5 w-full text-right rounded-xl border px-4 py-3 duration-150 ${
																	want ? "border-secondary bg-secondary/5" : "border-neutral-200 hover:border-secondary/40"
																}`}
															>
																<span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${want ? "bg-secondary border-secondary" : "border-neutral-300"}`}>
																	{want && <IconTick className="stroke-white w-4 h-4" strokeWidth={3.5} />}
																</span>
																<span className="text-sm font-medium text-primary">می‌خواهم این مدرک به تایید سفارت برسد</span>
															</button>
															{want && (
																<div className="flex flex-col gap-2">
																	<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
																		{embassyRates.result?.data?.data?.map((embassy) => {
																			const isSelected = (editState.embassies[key] ?? []).includes(embassy.embassyRateId);
																			return (
																				<SelectCard
																					key={embassy.embassyRateId}
																					selected={isSelected}
																					onClick={() =>
																						setEditState((prev) => {
																							if (!prev) return prev;
																							const current = prev.embassies[key] ?? [];
																							const updated = isSelected
																								? current.filter((id) => id !== embassy.embassyRateId)
																								: [...current, embassy.embassyRateId];
																							return { ...prev, embassies: { ...prev.embassies, [key]: updated } };
																						})
																					}
																					icon={<IconEmbassy viewBox="0 0 50 64" width={32} height={32} className="stroke-current stroke-2" />}
																					title={embassy.embassyName}
																				/>
																			);
																		})}
																	</div>
																	{!hasSelection && <span className="text-xs text-red-500">برای ادامه، حداقل یک سفارت را انتخاب کنید</span>}
																</div>
															)}
														</div>
													)}
												</DocumentSection>
											);
										})}
									</div>
								) : (
									<div className="text-sm text-neutral-400 py-4 text-center">تایید سفارتی برای این ترکیب تعریف نشده است</div>
								)}
							</div>
						)}

						{/* Step 8: Upload documents */}
						{step === 8 && (
							<div className="flex flex-col gap-8">
								<StepHeader
									title="آپلود مدارک"
									subtitle="تصویر مدارکی که قصد ترجمه‌ی آن‌ها را دارید، برای هر مدرک جداگانه بارگذاری کنید"
									icon={<IconUpload viewBox="0 0 32 32" width={26} height={26} className="stroke-0 fill-current" />}
								/>
								<div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
									{uploadDescription && (
										<div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-5">
											<div className="flex items-center gap-2 peyda font-bold text-primary mb-3">
												<IconRequired viewBox="0 0 100 100" width={22} height={22} className="fill-secondary stroke-0" />
												نکات بارگذاری مدارک
											</div>
											<div className="text-sm text-neutral-600 leading-7 whitespace-pre-line">{uploadDescription}</div>
										</div>
									)}
									<div className="flex items-start gap-2 text-xs text-neutral-600 bg-secondary/5 border border-secondary/20 rounded-xl p-3.5">
										<IconRequired viewBox="0 0 100 100" width={16} height={16} className="fill-secondary stroke-0 shrink-0 mt-0.5" />
										<span className="leading-6">
											این مدارک برای انجام ترجمه‌ی رسمی کافی نیست؛ پیک مجموعه برای دریافت اصل مدارک به محل شما مراجعه می‌کند و بارگذاری در این مرحله صرفاً برای افزایش سرعت ترجمه است.
										</span>
									</div>
									<div className="flex flex-col gap-5">
										{documentKeys.map((key, index) => (
											<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
												<UploadBox
													value={editState.assetsByDoc[key] ?? []}
													onChange={(urls) => setEditState((prev) => (prev ? { ...prev, assetsByDoc: { ...prev.assetsByDoc, [key]: urls } } : prev))}
													folder={assetFolderName(uploadScope, editState.translationItemNames[key] ?? "")}
													hint="فایل‌های این مدرک را اینجا رها کنید یا انتخاب نمایید"
												/>
												<DocumentDescriptionField
													docTitle={editState.translationItemNames[key] ?? "مدرک"}
													value={editState.descriptionByDoc[key] ?? ""}
													onChange={(desc) => setEditState((prev) => (prev ? { ...prev, descriptionByDoc: { ...prev.descriptionByDoc, [key]: desc } } : prev))}
												/>
											</DocumentSection>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Step 9: Passport */}
						{step === 9 && (
							<div className="flex flex-col gap-8">
								<StepHeader
									title="پاسپورت"
									subtitle="پاسپورت‌های مربوط به این سفارش را انتخاب یا بارگذاری کنید"
									icon={<IconUpload viewBox="0 0 32 32" width={26} height={26} className="stroke-0 fill-current" />}
								/>
								<div className="max-w-3xl mx-auto w-full">
									<PassportPicker value={editState.passports} onChange={(urls) => setEditState((prev) => (prev ? { ...prev, passports: urls } : prev))} />
								</div>
							</div>
						)}

						{/* Step 10: Copies */}
						{step === 10 && (
							<div className="flex flex-col gap-8">
								<StepHeader
									title="تعداد نسخه مدارک"
									subtitle="در صورت نیاز به نسخه‌ی اضافه، تعداد نسخه‌ی هر مدرک را مشخص کنید"
									icon={<IconCopy width={24} height={24} className="stroke-current fill-none" />}
								/>
								<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
									{documentKeys.map((key, index) => (
										<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
											<div className="flex flex-col gap-2">
												<span className="text-sm text-neutral-500">تعداد نسخه</span>
												<div className="w-full sm:w-72">
													<TabanInput
														isNumber
														type="number"
														value={editState.copyCount[key] ?? "1"}
														setValue={(val: string) =>
															setEditState((prev) => (prev ? { ...prev, copyCount: { ...prev.copyCount, [key]: val ?? "" } } : prev))
														}
														name={key}
													/>
												</div>
											</div>
										</DocumentSection>
									))}
									<div className="flex items-start gap-2 text-xs text-neutral-500 bg-neutral-100/60 border border-neutral-200 rounded-xl p-3.5 mt-1">
										<IconRequired viewBox="0 0 100 100" width={16} height={16} className="fill-secondary stroke-0 shrink-0 mt-0.5" />
										<span className="leading-6">
											برای نسخه‌های اضافه، هزینه‌ انجام ترجمه دریافت نمی‌گردد؛ ولی سایر هزینه‌ها مانند: خدمات، تاییدات و ... به ازای هر نسخه دریافت می‌گردد.
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Step 11: Scan */}
						{step === 11 && (
							<div className="flex flex-col gap-8">
								<StepHeader
									title="اسکن مدارک"
									subtitle="در صورت نیاز، می‌توانید برای هر مدرک سرویس اسکن را انتخاب کنید"
									icon={<IconDocument width={24} height={24} className="fill-current stroke-0" />}
								/>
								<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
									{documentKeys.map((key, index) => {
										const scanRate = scanRates.result?.success ? scanRates.result.data?.data?.[0] ?? null : null;
										const isSelected = !!editState.scanRateIdByDoc?.[key];
										return (
											<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
												<button
													type="button"
													onClick={() =>
														setEditState((prev) => {
															if (!prev) return prev;
															const current = prev.scanRateIdByDoc ?? {};
															const already = !!current[key];
															return { ...prev, scanRateIdByDoc: { ...current, [key]: already ? null : (scanRate?.scanRateId ?? null) } };
														})
													}
													className={`flex items-center gap-3 w-full text-right rounded-xl border px-4 py-4 duration-150 ${
														isSelected ? "border-secondary bg-secondary/5" : "border-neutral-200 hover:border-secondary/40"
													}`}
												>
													<span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? "bg-secondary border-secondary" : "border-neutral-300"}`}>
														{isSelected && <IconTick className="stroke-white w-4 h-4" strokeWidth={3.5} />}
													</span>
													<div className="flex flex-1 items-center justify-between">
														<span className="text-sm font-medium text-primary">اسکن این مدرک</span>
														{scanRate && (
															<span className={`text-sm font-semibold ${isSelected ? "text-secondary" : "text-neutral-500"}`}>
																{toCurrency(scanRate.price)} تومان
															</span>
														)}
													</div>
												</button>
											</DocumentSection>
										);
									})}
								</div>
							</div>
						)}

						{/* Step 12: Summary */}
						{step === 12 && (
							<div className="flex flex-col gap-8">
								<StepHeader title="خلاصه سفارش" subtitle="جزئیات نرخ سفارش خود را بررسی و آن را ذخیره کنید" />
								<div className="max-w-3xl mx-auto w-full">
									{calculation.loading && !calculation.result ? (
										<div className="flex items-center gap-2 justify-center py-16">
											<TabanLoading size={24} />
											<span className="text-sm text-neutral-500">در حال محاسبه نرخ سفارش...</span>
										</div>
									) : calculation.result?.success && calculation.result.data?.data ? (
										(() => {
											const bd = calculation.result.data.data;
											return (
												<div className="flex flex-col gap-5">
													<div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-5 flex flex-col gap-3">
														<div className="flex items-center justify-between text-sm">
															<span className="text-neutral-500">مدرک ترجمه</span>
															<div className="flex items-center gap-2">
																<span className="peyda font-semibold text-primary">{bd.translationItemTitle}</span>
																{bd.documents.length > 1 && (
																	<span className="text-[11px] text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded">
																		× {convertToPersianNumber(String(bd.documents.length))}
																	</span>
																)}
															</div>
														</div>
														<div className="h-[1px] w-full bg-neutral-200" />
														<div className="flex items-center justify-between text-sm">
															<span className="text-neutral-500">زبان ترجمه</span>
															<span className="peyda font-semibold text-primary">{bd.languageName}</span>
														</div>
													</div>

													<div className="flex flex-col gap-3">
														{bd.documents.map((doc) => (
															<div key={doc.documentKey} className="rounded-2xl border border-neutral-200 p-4 flex flex-col gap-2.5">
																<div className="flex items-center justify-between pb-2 border-b border-dashed border-neutral-200">
																	<div className="flex items-center gap-1.5 peyda font-bold text-secondary text-sm">
																		<span className="w-2 h-2 rounded-sm bg-secondary rotate-45" />
																		{doc.title}
																		{(doc.copyCount ?? 1) > 1 && (
																			<span className="text-[10px] text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded mr-1">
																				× {convertToPersianNumber(String(doc.copyCount))} نسخه
																			</span>
																		)}
																	</div>
																	<div className="flex items-center gap-1 peyda font-semibold text-primary text-sm">
																		{toCurrency(doc.documentTotal)}
																		<span className="text-xs font-normal text-neutral-400">تومان</span>
																	</div>
																</div>
																<div className="flex flex-col gap-1.5 text-xs text-neutral-500">
																	<div className="flex items-center justify-between">
																		<span>هزینه ترجمه</span>
																		<span>{toCurrency(doc.translationTotal ?? doc.base.total + doc.specialsTotal)} تومان</span>
																	</div>
																	{doc.mfaCertification && (
																		<div className="flex items-center justify-between">
																			<span>مهر وزارت امور خارجه</span>
																			<span>{toCurrency(doc.mfaCertification.price)} تومان</span>
																		</div>
																	)}
																	{doc.justiceCertification && (
																		<div className="flex items-center justify-between">
																			<span>مهر دادگستری</span>
																			<span>{toCurrency(doc.justiceCertification.price)} تومان</span>
																		</div>
																	)}
																	{doc.embassyApprovals?.map((e) => (
																		<div key={e.embassyRateId} className="flex items-center justify-between">
																			<span>{e.embassyName}</span>
																			<span>{toCurrency(e.price)} تومان</span>
																		</div>
																	))}
																	{doc.justiceInquiries.map((i) => (
																		<div key={i.justiceInquiryRateId} className="flex items-center justify-between">
																			<span>{i.justiceInquiryName}</span>
																			<span>{toCurrency(i.price)} تومان</span>
																		</div>
																	))}
																</div>
															</div>
														))}
													</div>

													<div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-5 flex flex-col gap-3">
														<SummaryRow label="مبلغ ترجمه" value={bd.summary.translationPrice} />
														{!!bd.summary.tierDiscountPercent && bd.summary.tierDiscountPercent > 0 && (
															<div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 -mt-1">
																<div className="flex items-center gap-2 text-sm text-emerald-700">
																	<IconStar className="fill-emerald-500 stroke-0 w-4 h-4" />
																	<span>تخفیف باشگاه مشتریان ({bd.summary.tierDiscountPercent}٪)</span>
																</div>
																<div className="flex items-center gap-1 font-semibold text-emerald-700">
																	{toCurrency(bd.summary.tierDiscountAmount ?? 0)}-
																	<span className="text-xs font-normal text-emerald-500">تومان</span>
																</div>
															</div>
														)}
														<div className="h-[1px] w-full bg-neutral-200" />
														<SummaryRow label="مبلغ تاییدات" value={bd.summary.certificationPrice} />
														<div className="h-[1px] w-full bg-neutral-200" />
														<SummaryRow label="مبلغ استعلام‌ها" value={bd.summary.inquiryPrice} />
														<div className="h-[1px] w-full bg-neutral-200" />
														<SummaryRow label="مبلغ تایید سفارت" value={bd.summary.embassyPrice ?? 0} />
														{(bd.summary.scanPrice ?? 0) > 0 && (
															<>
																<div className="h-[1px] w-full bg-neutral-200" />
																<SummaryRow label="مبلغ اسکن مدارک" value={bd.summary.scanPrice ?? 0} />
															</>
														)}
														{bd.summary.taxPercent > 0 && (
															<>
																<div className="h-[1px] w-full bg-neutral-200" />
																<SummaryRow label={`مالیات (${bd.summary.taxPercent}٪)`} value={bd.summary.taxPrice} />
															</>
														)}
														<div className="h-[1px] w-full bg-neutral-200" />
														<SummaryRow label="مبلغ کل سفارش" value={bd.summary.totalPrice} bold />
													</div>

													<DeliverySection
														hasJustice={bd.documents.some((d) => !!d.justiceCertification)}
														hasMfa={bd.documents.some((d) => !!d.mfaCertification)}
														desiredDate={editState.desiredDeliveryDate}
														onDateChange={(d) => setEditState((prev) => (prev ? { ...prev, desiredDeliveryDate: d } : prev))}
													/>
												</div>
											);
										})()
									) : calculation.result && !calculation.result.success ? (
										<ErrorComponent
											executeFunction={() => calcPayload && calculation.fetchData(calcPayload)}
											callAble
											errorText={calculation.result.description || "محاسبه نرخ با خطا مواجه شد"}
										/>
									) : (
										<div className="text-sm text-neutral-400 py-4 text-center">اطلاعات کافی برای محاسبه نرخ وجود ندارد</div>
									)}
								</div>
							</div>
						)}
					</motion.div>
				</div>

				{/* Navigation buttons */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Link href="/cart">
							<TabanButton variant="text">انصراف</TabanButton>
						</Link>
						{step > 1 && (
							<TabanButton variant="bordered" onClick={goPrev}>
								مرحله قبلی
							</TabanButton>
						)}
					</div>
					{step < TOTAL_STEPS ? (
						<TabanButton onClick={goNext} icon={<IconArrowLine />} disabled={!canProceed}>
							مرحله بعدی
						</TabanButton>
					) : (
						<TabanButton onClick={submitUpdate} isLoading={updateItem.loading} disabled={updateItem.loading || calculation.loading}>
							ذخیره و بروزرسانی سفارش
						</TabanButton>
					)}
				</div>
			</div>
		</div>
	);
}
