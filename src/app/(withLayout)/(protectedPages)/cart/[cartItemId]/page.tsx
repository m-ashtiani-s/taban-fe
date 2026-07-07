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
	IconCheck,
	IconDocument,
	IconEmbassy,
	IconInfo,
	IconInquiry,
	IconJustice,
	IconMfa,
	IconRequired,
	IconTick,
	IconTranslate,
} from "@/app/_components/icon/icons";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";

const TOTAL_STEPS = 12;

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

	// اگر با وجود آماده‌شدنِ نرخ‌ها همچنان روی مرحله‌ی نرخ پایه بمانیم ولی نرخی نباشد، رد شو
	useEffect(() => {
		if (step === 3 && skipBaseStep) setStep(4);
	}, [step, skipBaseStep]);

	const goNext = () =>
		setStep((s) => {
			const next = Math.min(s + 1, TOTAL_STEPS);
			return next === 3 && skipBaseStep ? 4 : next;
		});

	const goPrev = () =>
		setStep((s) => {
			const prev = Math.max(s - 1, 1);
			return prev === 3 && skipBaseStep ? 2 : prev;
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

	return (
		<div className="flex flex-col gap-4 pt-16 max-lg:pt-8 px-4">
			{/* Step indicator bar */}
			<div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
				<div>
					<div className="peyda font-bold text-primary">ویرایش سفارش ترجمه</div>
					<div className="text-xs text-neutral-500">
						{editState.translationItemTitle} · {editState.languageName}
					</div>
				</div>
				<div className="flex items-center gap-1.5 flex-wrap">
					{Array.from({ length: TOTAL_STEPS }).map((_, i) => (
						<div
							key={i}
							className={`h-2 rounded-full duration-300 ${
								i + 1 === step
									? "w-6 bg-primary"
									: i + 1 < step
										? "w-3 bg-primary/40"
										: "w-3 bg-neutral-200"
							}`}
						/>
					))}
				</div>
				<div className="text-sm text-neutral-500 peyda">
					مرحله {step} از {TOTAL_STEPS}
				</div>
			</div>

			{/* Step content */}
			<div className="bg-white border border-neutral-200 rounded-2xl p-5 min-h-80">
				{/* Step 1: Document info */}
				{step === 1 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">اطلاعات مدارک</div>
						<div className="flex flex-col gap-5">
							{documentKeys.map((key, index) => {
								const nameValue = editState.translationItemNames[key] ?? "";
								const nameError = documentKeys.length > 1 && !nameValue.trim();
								return (
									<div key={key} className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
											<IconDocument className="fill-primary stroke-0 w-4 h-4" />
										</div>
										<div className="flex-1">
											<TabanInput
												value={nameValue}
												name={key}
												placeholder={namePlaceholder}
												label={`نام مدرک شماره ${index + 1}`}
												setValue={(val: string) =>
													setEditState((prev) =>
														prev ? { ...prev, translationItemNames: { ...prev.translationItemNames, [key]: val ?? "" } } : prev
													)
												}
												isHandleError
												hasError={nameError}
												errorText={nameError ? "وارد کردن نام مدرک الزامی است" : ""}
											/>
										</div>
									</div>
								);
							})}
						</div>
						<div className="text-sm bg-secondary/10 border border-secondary/20 text-primary p-3 rounded-lg flex items-center gap-2">
							<IconTranslate stroke="#1a3047" strokeWidth={0} className="fill-primary w-4 h-4 shrink-0" />
							<span>
								نوع مدرک:{" "}
								<span className="font-semibold">{editState.translationItemTitle}</span>
							</span>
						</div>
					</div>
				)}

				{/* Step 2: Language + official type */}
				{step === 2 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">انتخاب زبان ترجمه</div>
						{languages.loading && !languages.result ? (
							<div className="flex justify-center py-8">
								<TabanLoading size={24} />
							</div>
						) : languages.result?.success && (languages.result.data?.data?.length ?? 0) > 0 ? (
							<div className="flex flex-wrap gap-3">
								{languages.result.data?.data?.map((lang, index) => (
									<motion.div
										key={lang.languageId}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.04, duration: 0.3 }}
									>
										<div
											onClick={() =>
												setEditState((prev) =>
													prev
														? {
																...prev,
																languageId: lang.languageId,
																languageName: lang.languageName,
															}
														: prev
												)
											}
											className={`border rounded-lg cursor-pointer flex items-center gap-3 p-3 duration-200 min-w-36 ${
												editState.languageId === lang.languageId
													? "bg-secondary border-secondary"
													: "border-neutral-300 hover:bg-secondary/10"
											}`}
										>
											<Image
												width={28}
												height={28}
												alt=""
												src={`/images/languages/${lang.languageCode}.png`}
											/>
											<span
												className={`peyda font-semibold text-sm ${
													editState.languageId === lang.languageId ? "text-white" : ""
												}`}
											>
												{lang.languageName}
											</span>
										</div>
									</motion.div>
								))}
							</div>
						) : languages.result && !languages.result.success && isRetryAble(languages.result.code) ? (
							<ErrorComponent
								executeFunction={() => languages.fetchData()}
								callAble
								errorText="دریافت لیست زبان‌ها با خطا مواجه شد"
							/>
						) : null}

						{/* نوع ترجمه به‌صورت پیش‌فرض «رسمی» است و فعلاً از کاربر پرسیده نمی‌شود (مخفی) */}
					</div>
				)}

				{/* Step 3: Base rates */}
				{step === 3 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">نرخ پایه ترجمه</div>
						{baseRate.loading && !baseRate.result ? (
							<div className="flex justify-center py-8">
								<TabanLoading size={24} />
							</div>
						) : baseRate.result?.success && (baseRate.result.data?.data?.length ?? 0) > 0 ? (
							<div className="flex flex-col gap-6">
								{documentKeys.map((key, index) => (
									<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
										<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
											<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
											{baseRate.result?.data?.data?.[0]?.title} برای{" "}
											{editState.translationItemNames[key]}
										</div>
										<div className="w-64">
											<TabanInput
												isNumber
												type="number"
												value={editState.baseRateCount[key] ?? ""}
												// groupMode
												setValue={(val: string) =>
													setEditState((prev) =>
														prev
															? {
																	...prev,
																	baseRateCount: {
																		...prev.baseRateCount,
																		[key]: val ?? "",
																	},
																}
															: prev
													)
												}
												name={key}
											/>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">
								نرخ پایه‌ای برای این ترکیب تعریف نشده است
							</div>
						)}
					</div>
				)}

				{/* Step 4: Special items */}
				{step === 4 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">موارد خاص ترجمه</div>
						{dynamicRates.loading && !dynamicRates.result ? (
							<div className="flex justify-center py-8">
								<TabanLoading size={24} />
							</div>
						) : dynamicRates.result?.success && (dynamicRates.result.data?.data?.length ?? 0) > 0 ? (
							<div className="flex flex-col gap-6">
								{documentKeys.map((key) => (
									<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
										<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
											<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
											موارد خاص برای {editState.translationItemNames[key]}
										</div>
										<div className="flex flex-wrap gap-6">
											{dynamicRates.result?.data?.data?.map((rate, index) => (
												<motion.div
													key={rate.dynamicRateId}
													className="w-48"
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.04 }}
												>
													<div className="flex flex-col gap-1.5">
														<div className="text-sm font-semibold text-neutral-600">
															{rate.label}
														</div>
														<TabanInput
															isNumber
															type="number"
															value={
																editState.specialItems[key]?.[
																	rate.dynamicRateId
																] ?? ""
															}
															onChange={(e) =>
																setEditState((prev) => {
																	if (!prev) return prev;
																	return {
																		...prev,
																		specialItems: {
																			...prev.specialItems,
																			[key]: {
																				...prev.specialItems[key],
																				[rate.dynamicRateId]:
																					e.target.value,
																			},
																		},
																	};
																})
															}
															name={rate.dynamicRateId}
														/>
													</div>
												</motion.div>
											))}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">
								موارد خاصی برای این ترکیب تعریف نشده است
							</div>
						)}
					</div>
				)}

				{/* Step 5: Certifications */}
				{step === 5 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">مهر و تاییدات ترجمه</div>
						{certificationRates.loading && !certificationRates.result ? (
							<div className="flex justify-center py-8">
								<TabanLoading size={24} />
							</div>
						) : certificationRates.result?.success && (certificationRates.result.data?.data?.length ?? 0) > 0 ? (
							<div className="flex flex-col gap-6">
								{documentKeys.map((key) => {
									const rateId =
										certificationRates.result?.data?.data?.[0]?.certificationRateId ?? null;
									return (
										<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
											<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
												<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
												تاییدات برای {editState.translationItemNames[key]}
											</div>
											<div className="flex flex-wrap gap-4">
												{/* Justice certification */}
												<motion.div
													className="flex-1 min-w-48"
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
												>
													<div
														onClick={() => {
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
																return {
																	...prev,
																	justiceCertification: { ...prev.justiceCertification, [key]: rateId },
																};
															});
														}}
														className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer duration-200 ${
															editState.justiceCertification[key]
																? "bg-secondary border-secondary"
																: "border-neutral-300 hover:bg-secondary/10"
														}`}
													>
														<IconJustice
															width={36}
															height={36}
															viewBox="0 0 48 48"
															className={`shrink-0 ${
																editState.justiceCertification[key]
																	? "fill-white stroke-0"
																	: "fill-primary stroke-0"
															}`}
														/>
														<div className="flex items-center gap-2">
															<span
																className={`peyda font-semibold ${
																	editState.justiceCertification[key]
																		? "text-white"
																		: ""
																}`}
															>
																مهر دادگستری
															</span>
														</div>
													</div>
												</motion.div>

												{/* MFA certification */}
												<motion.div
													className="flex-1 min-w-48"
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: 0.05 }}
												>
													<div
														onClick={() => {
															setEditState((prev) => {
																if (!prev) return prev;
																const current =
																	prev.mfaCertification[key];
																if (current) {
																	// حذف امور خارجه: تایید سفارتِ این مدرک هم پاک می‌شود
																	return {
																		...prev,
																		mfaCertification: {
																			...prev.mfaCertification,
																			[key]: null,
																		},
																		embassies: { ...prev.embassies, [key]: [] },
																	};
																}
																// انتخاب مهر امور خارجه، مهر دادگستری را هم اجباراً فعال می‌کند
																return {
																	...prev,
																	mfaCertification: {
																		...prev.mfaCertification,
																		[key]: rateId,
																	},
																	justiceCertification: {
																		...prev.justiceCertification,
																		[key]:
																			prev.justiceCertification[key] ??
																			rateId,
																	},
																};
															});
														}}
														className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer duration-200 ${
															editState.mfaCertification[key]
																? "bg-secondary border-secondary"
																: "border-neutral-300 hover:bg-secondary/10"
														}`}
													>
														<IconMfa
															width={36}
															height={36}
															className={`shrink-0 ${
																editState.mfaCertification[key]
																	? "!stroke-white"
																	: "stroke-primary"
															}`}
														/>
														<div className="flex flex-col">
															<span
																className={`peyda font-semibold ${
																	editState.mfaCertification[key]
																		? "text-white"
																		: ""
																}`}
															>
																مهر وزارت امور خارجه
															</span>
														</div>
													</div>
												</motion.div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">
								تاییداتی برای این ترکیب تعریف نشده است
							</div>
						)}

						<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-2.5">
							<IconInfo className="stroke-amber-600 w-5 h-5 shrink-0 mt-0.5" />
							<span className="text-sm leading-7 text-amber-700">
								لازم به ذکر است که جهت اخذ تاییدات، ارائه‌ی اصل مدارک به ارگان‌های مربوطه الزامی است.
							</span>
						</div>
					</div>
				)}

				{/* Step 6: Justice inquiries */}
				{step === 6 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">استعلام‌های ترجمه</div>
						{justiceInquiryRates.loading && !justiceInquiryRates.result ? (
							<div className="flex justify-center py-8">
								<TabanLoading size={24} />
							</div>
						) : justiceInquiryRates.result?.success && (justiceInquiryRates.result.data?.data?.length ?? 0) > 0 ? (
							documentKeys.filter((key) => !!editState.justiceCertification[key]).length === 0 ? (
								<div className="flex items-center gap-2.5 bg-secondary/5 border border-secondary/30 rounded-2xl px-4 py-4">
									<IconJustice width={26} height={26} viewBox="0 0 48 48" className="fill-secondary stroke-0 shrink-0" />
									<span className="text-sm leading-7 text-primary peyda font-semibold">
										استعلام تنها برای مدارکی قابل انتخاب است که «مهر دادگستری» دارند. در صورت نیاز، در مرحله‌ی تاییدات مهر دادگستری را فعال کنید.
									</span>
								</div>
							) : (
								<div className="flex flex-col gap-6">
									{documentKeys.filter((key) => !!editState.justiceCertification[key]).map((key) => {
										const selfInq = !!editState.selfInquiry[key];
										return (
											<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
												<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
													<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
													استعلام برای {editState.translationItemNames[key]}
												</div>
												<div className={`flex flex-wrap gap-4 ${selfInq ? "opacity-40 pointer-events-none select-none" : ""}`}>
													{justiceInquiryRates.result?.data?.data?.map((inquiry, index) => {
														const isSelected = !selfInq && (editState.justiceInquiries[key] ?? []).includes(inquiry.justiceInquiryRateId);
														return (
															<motion.div key={inquiry.justiceInquiryRateId} className="flex-1 min-w-48" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
																<div
																	onClick={() => {
																		if (selfInq) return;
																		setEditState((prev) => {
																			if (!prev) return prev;
																			const current = prev.justiceInquiries[key] ?? [];
																			const updated = isSelected
																				? current.filter((id) => id !== inquiry.justiceInquiryRateId)
																				: [...current, inquiry.justiceInquiryRateId];
																			return { ...prev, justiceInquiries: { ...prev.justiceInquiries, [key]: updated } };
																		});
																	}}
																	className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer duration-200 ${isSelected ? "bg-secondary border-secondary" : "border-neutral-300 hover:bg-secondary/10"}`}
																>
																	<IconInquiry width={32} height={32} viewBox="0 0 1024 1024" className={`shrink-0 ${isSelected ? "fill-white stroke-0" : "fill-primary stroke-0"}`} />
																	<span className={`peyda font-semibold text-sm ${isSelected ? "text-white" : ""}`}>{inquiry.justiceInquiryName}</span>
																</div>
															</motion.div>
														);
													})}
												</div>

												<div className="mt-4">
													<button
														type="button"
														onClick={() =>
															setEditState((prev) => {
																if (!prev) return prev;
																const next = !prev.selfInquiry[key];
																const justiceInquiries = next
																	? { ...prev.justiceInquiries, [key]: [] }
																	: prev.justiceInquiries;
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
											</div>
										);
									})}
								</div>
							)
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">استعلامی برای این ترکیب تعریف نشده است</div>
						)}
					</div>
				)}

				{/* Step 7: Embassy approvals */}
					{step === 7 && (
						<div className="flex flex-col gap-4">
							<div className="peyda font-bold text-xl text-primary">تایید سفارت</div>
							{!embassyStepValid && (
								<span className="text-xs text-red-500">
									برای مدارکی که تیک «تایید سفارت» را زده‌اید، انتخابِ حداقل یک سفارت الزامی است
								</span>
							)}
							{embassyRates.loading && !embassyRates.result ? (
								<div className="flex justify-center py-8">
									<TabanLoading size={24} />
								</div>
							) : embassyRates.result?.success && (embassyRates.result.data?.data?.length ?? 0) > 0 ? (
								<div className="flex flex-col gap-6">
									{documentKeys.map((key) => {
										const allowed = !!editState.justiceCertification[key] && !!editState.mfaCertification[key];
										const want = !!wantEmbassyByDoc[key];
										return (
											<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
												<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
													<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
													تایید سفارت برای {editState.translationItemNames[key]}
												</div>
												{!allowed ? (
													<div className="flex items-center gap-2.5 bg-secondary/5 border border-secondary/30 rounded-xl px-3 py-2.5">
														<IconEmbassy viewBox="0 0 50 64" width={22} height={22} className="stroke-secondary stroke-2 shrink-0" />
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
															<div className="flex flex-wrap gap-4">
																{embassyRates.result?.data?.data?.map((embassy, index) => {
																	const isSelected = (editState.embassies[key] ?? []).includes(embassy.embassyRateId);
																	return (
																		<motion.div key={embassy.embassyRateId} className="flex-1 min-w-48" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
																			<div
																				onClick={() => {
																					setEditState((prev) => {
																						if (!prev) return prev;
																						const current = prev.embassies[key] ?? [];
																						const updated = isSelected
																							? current.filter((id) => id !== embassy.embassyRateId)
																							: [...current, embassy.embassyRateId];
																						return { ...prev, embassies: { ...prev.embassies, [key]: updated } };
																					});
																				}}
																				className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer duration-200 ${
																					isSelected ? "bg-secondary border-secondary" : "border-neutral-300 hover:bg-secondary/10"
																				}`}
																			>
																				<IconEmbassy viewBox="0 0 50 64"  width={32} height={32} className={`shrink-0 ${isSelected ? "stroke-white stroke-2" : "stroke-primary stroke-2"}`} />
																				<span className={`peyda font-semibold text-sm ${isSelected ? "text-white" : ""}`}>{embassy.embassyName}</span>
																			</div>
																		</motion.div>
																	);
																})}
															</div>
														)}
													</div>
												)}
											</div>
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
						<div className="flex flex-col gap-4">
							<div className="peyda font-bold text-xl text-primary">آپلود مدارک و اسناد</div>
							{uploadDescription && (
								<div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4">
									<div className="flex items-center gap-2 peyda font-bold text-primary mb-2 text-sm">
										<IconRequired viewBox="0 0 100 100" width={18} height={18} className="fill-secondary stroke-0" />
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
							<div className="flex flex-col gap-6">
								{documentKeys.map((key) => (
									<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
										<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
											<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
											آپلود {editState.translationItemNames[key]}
										</div>
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
									</div>
								))}
							</div>
						</div>
					)}

					{/* Step 9: Upload passport */}
				{step === 9 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">پاسپورت</div>
						<PassportPicker value={editState.passports} onChange={(urls) => setEditState((prev) => (prev ? { ...prev, passports: urls } : prev))} />
					</div>
				)}

				{/* Step 10: Copies */}
					{step === 10 && (
						<div className="flex flex-col gap-4">
							<div className="peyda font-bold text-xl text-primary">تعداد نسخه مدارک</div>
							<div className="flex flex-col gap-6">
								{documentKeys.map((key) => (
									<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
										<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
											<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
											تعداد نسخه برای {editState.translationItemNames[key]}
										</div>
										<div className="w-64">
											<TabanInput
												isNumber
												type="number"
												value={editState.copyCount[key] ?? "1"}
												// groupMode
												setValue={(val: string) =>
													setEditState((prev) =>
														prev ? { ...prev, copyCount: { ...prev.copyCount, [key]: val ?? "" } } : prev
													)
												}
												name={key}
											/>
										</div>
									</div>
								))}
							</div>
							<div className="flex items-start gap-2 text-xs text-neutral-500 bg-neutral-100/60 border border-neutral-200 rounded-xl p-3.5">
								<IconRequired viewBox="0 0 100 100" width={16} height={16} className="fill-secondary stroke-0 shrink-0 mt-0.5" />
								<span className="leading-6">
									برای نسخه‌های اضافه، هزینه‌ انجام ترجمه دریافت نمی‌گردد؛ ولی سایر هزینه‌ها مانند: خدمات، تاییدات و ... به ازای هر نسخه دریافت می‌گردد.
								</span>
							</div>
						</div>
					)}

					{/* Step 11: Scan */}
				{step === 11 && (
					<div className="flex flex-col gap-8">
						<div className="flex flex-col gap-1.5">
							<div className="peyda font-bold text-xl text-primary">اسکن مدارک</div>
							<div className="text-sm text-neutral-500">در صورت نیاز، می‌توانید برای هر مدرک سرویس اسکن را انتخاب کنید</div>
						</div>
						<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
							{documentKeys.map((key) => {
								const scanRate = scanRates.result?.success ? scanRates.result.data?.data?.[0] ?? null : null;
								const isSelected = !!(editState.scanRateIdByDoc?.[key]);
								return (
									<div key={key} className="border border-neutral-200 rounded-xl p-4">
										<div className="text-sm font-bold text-secondary mb-3 flex items-center gap-1.5">
											<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
											{editState.translationItemNames[key]}
										</div>
										<button
											type="button"
											onClick={() => {
												setEditState((prev) => {
													if (!prev) return prev;
													const current = prev.scanRateIdByDoc ?? {};
													const already = !!current[key];
													return {
														...prev,
														scanRateIdByDoc: {
															...current,
															[key]: already ? null : (scanRate?.scanRateId ?? null),
														},
													};
												});
											}}
											className={`flex items-center gap-3 w-full text-right rounded-xl border px-4 py-4 duration-150 ${
												isSelected ? "border-secondary bg-secondary/5" : "border-neutral-200 hover:border-secondary/40"
											}`}
										>
											<span
												className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
													isSelected ? "bg-secondary border-secondary" : "border-neutral-300"
												}`}
											>
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
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Step 12: Summary */}
				{step === 12 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">خلاصه سفارش</div>
						{calculation.loading && !calculation.result ? (
							<div className="flex items-center gap-2 justify-center py-8">
								<TabanLoading size={24} />
								<span className="text-sm text-neutral-500">در حال محاسبه نرخ سفارش...</span>
							</div>
						) : calculation.result?.success && calculation.result.data?.data ? (
							(() => {
								const bd = calculation.result.data.data;
								return (
									<div className="flex flex-col gap-2">
										<div className="flex items-center justify-between text-sm py-1">
											<span className="text-neutral-500">مدرک ترجمه:</span>
											<span className="font-medium">{bd.translationItemTitle}</span>
										</div>
										<div className="flex items-center justify-between text-sm py-1">
											<span className="text-neutral-500">زبان ترجمه:</span>
											<span className="font-medium">{bd.languageName}</span>
										</div>
										<div className="h-px bg-neutral-100 my-2" />
										{bd.documents.map((doc) => (
											<div
												key={doc.documentKey}
												className="border border-neutral-200 rounded-lg p-3 flex flex-col gap-2"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-1.5 text-sm font-bold text-secondary">
														<div className="w-2 h-2 rounded bg-primary/70 rotate-45" />
														{doc.title}
														{(doc.copyCount ?? 1) > 1 && (
															<span className="text-[10px] text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded mr-1">
																× {convertToPersianNumber(String(doc.copyCount))} نسخه
															</span>
														)}
													</div>
													<div className="font-semibold text-sm">
														{toCurrency(doc.documentTotal)} تومان
													</div>
												</div>
												<div className="flex flex-col gap-1 text-xs text-neutral-500">
													<div className="flex justify-between">
														<span>هزینه ترجمه</span>
														<span>
															{toCurrency(doc.translationTotal ?? doc.base.total + doc.specialsTotal)} تومان
														</span>
													</div>
													{doc.mfaCertification && (
														<div className="flex justify-between">
															<span>مهر وزارت امور خارجه</span>
															<span>
																{toCurrency(doc.mfaCertification.price)}{" "}
																تومان
															</span>
														</div>
													)}
													{doc.justiceCertification && (
														<div className="flex justify-between">
															<span>مهر دادگستری</span>
															<span>
																{toCurrency(
																	doc.justiceCertification.price
																)}{" "}
																تومان
															</span>
														</div>
													)}
													{doc.embassyApprovals?.map((e) => (
															<div key={e.embassyRateId} className="flex justify-between">
																<span>{e.embassyName}</span>
																<span>{toCurrency(e.price)} تومان</span>
															</div>
														))}
														{doc.justiceInquiries.map((i) => (
														<div
															key={i.justiceInquiryRateId}
															className="flex justify-between"
														>
															<span>{i.justiceInquiryName}</span>
															<span>{toCurrency(i.price)} تومان</span>
														</div>
													))}
												</div>
											</div>
										))}
										<div className="h-px bg-neutral-100 my-1" />
										<div className="flex justify-between text-sm py-1">
											<span>مبلغ ترجمه:</span>
											<span className="font-semibold">
												{toCurrency(bd.summary.translationPrice)} تومان
											</span>
										</div>
										{!!bd.summary.tierDiscountPercent && bd.summary.tierDiscountPercent > 0 && (
										<div className="flex justify-between text-sm py-1 text-emerald-600">
											<span>تخفیف باشگاه مشتریان ({bd.summary.tierDiscountPercent}٪):</span>
											<span className="font-semibold">
												{toCurrency(bd.summary.tierDiscountAmount ?? 0)}- تومان
											</span>
										</div>
										)}
										<div className="flex justify-between text-sm py-1">
											<span>مبلغ تاییدات:</span>
											<span className="font-semibold">
												{toCurrency(bd.summary.certificationPrice)} تومان
											</span>
										</div>
										<div className="flex justify-between text-sm py-1">
											<span>مبلغ استعلام‌ها:</span>
											<span className="font-semibold">
												{toCurrency(bd.summary.inquiryPrice)} تومان
												</span>
											</div>
											<div className="flex justify-between text-sm py-1">
												<span>مبلغ تایید سفارت:</span>
												<span className="font-semibold">
													{toCurrency(bd.summary.embassyPrice ?? 0)} تومان
											</span>
										</div>
										{(bd.summary.scanPrice ?? 0) > 0 && (
											<div className="flex justify-between text-sm py-1">
												<span>مبلغ اسکن مدارک:</span>
												<span className="font-semibold">
													{toCurrency(bd.summary.scanPrice ?? 0)} تومان
												</span>
											</div>
										)}
										{bd.summary.taxPercent > 0 && (
											<>
										<div className="flex justify-between text-sm py-1">
											<span>
												مالیات ({bd.summary.taxPercent}٪):
											</span>
											<span className="font-semibold">
												{toCurrency(bd.summary.taxPrice)} تومان
											</span>
										</div>
											</>
										)}
										<div className="h-px bg-neutral-100 my-1" />
										<div className="flex justify-between font-bold py-1">
											<span>مبلغ کل سفارش:</span>
											<span className="text-lg text-primary">
												{toCurrency(bd.summary.totalPrice)} تومان
											</span>
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
							<div className="text-sm text-neutral-400 py-4 text-center">
								اطلاعات کافی برای محاسبه نرخ وجود ندارد
							</div>
						)}
					</div>
				)}
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
					<TabanButton
						onClick={submitUpdate}
						isLoading={updateItem.loading}
						disabled={updateItem.loading || calculation.loading}
					>
						ذخیره و بروزرسانی سفارش
					</TabanButton>
				)}
			</div>
		</div>
	);
}
