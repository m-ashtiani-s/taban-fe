"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { toCurrency } from "@/utils/string";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import FileUploader from "@/app/_components/common/fileUploader/fileUploader";
import { useNotificationStore } from "@/stores/notification.store";
import {
	IconArrowLine,
	IconDocument,
	IconEmbassy,
	IconGuarantee,
	IconInquiry,
	IconJustice,
	IconMfa,
	IconTranslate,
	IconUpload,
} from "@/app/_components/icon/icons";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";

const TOTAL_STEPS = 10;

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
	embassies: Record<string, string[]>;
	passports: string[];
	assets: string[];
};

function buildInitialState(item: CartItem): EditState {
	const { payload, breakdown } = item;
	const translationItemNames: Record<string, string> = {};
	const baseRateCount: Record<string, string> = {};
	const specialItems: Record<string, Record<string, string>> = {};
	const mfaCertification: Record<string, string | null> = {};
	const justiceCertification: Record<string, string | null> = {};
	const justiceInquiries: Record<string, string[]> = {};
	const embassies: Record<string, string[]> = {};

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
		embassies[doc.documentKey] = doc.embassyRateIds ?? [];
	});

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
		embassies,
		passports: payload.passports ?? [],
		assets: payload.assets ?? [],
	};
}

export default function CartEditPage() {
	const params = useParams();
	const router = useRouter();
	const cartItemId = params?.cartItemId as string;
	const { cart, setCart } = useCartStore();
	const showNotification = useNotificationStore((s) => s.showNotification);

	const [step, setStep] = useState(1);
	const [editState, setEditState] = useState<EditState | null>(null);

	const [assetFiles, setAssetFiles] = useState<File[]>([]);
	const [passportFiles, setPassportFiles] = useState<File[]>([]);

	const getCart = useApi(async () => await CartEndpoints.getCart());
	const languages = useApi(async () => await TranslationEndpoints.getLanguages(), true);
	const baseRate = useApi(async (filters: RateFilters) => await TranslationEndpoints.getBaseRate(filters));
	const dynamicRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getDynamicRates(filters));
	const certificationRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getCertificationRates(filters));
	const justiceInquiryRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getJusticeInquiriesRates(filters));
	const embassyRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getEmbassyRates(filters));
	const calculation = useApi(async (payload: RateCalculationRequest) => await TranslationEndpoints.calculateRate(payload));
	const updateItem = useApi(async (payload: AddDocumentToCartPayload) => await CartEndpoints.updateCartItem(cartItemId, payload));
	const uploadAssets = useApi(async (files: File[]) => await TranslationEndpoints.uploadStorageFiles(files, "assets"));
	const uploadPassports = useApi(async (files: File[]) => await TranslationEndpoints.uploadStorageFiles(files, "passports"));

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

	// Fetch all rates based on current translationItem + language
	const fetchRates = (state: EditState) => {
		const filters: RateFilters = {
			translationItemId: state.translationItemId,
			languageId: state.languageId,
		};
		baseRate.fetchData(filters);
		dynamicRates.fetchData(filters);
		certificationRates.fetchData(filters);
		justiceInquiryRates.fetchData(filters);
		embassyRates.fetchData(filters);
	};

	// Upload handlers
	useEffect(() => {
		if (!uploadAssets.result) return;
		if (uploadAssets.result.success) {
			const urls = uploadAssets.result.data ?? [];
			setEditState((prev) => prev ? { ...prev, assets: [...prev.assets, ...urls] } : prev);
			setAssetFiles([]);
			showNotification({ type: "success", message: "آپلود مدارک با موفقیت انجام شد" });
		} else {
			showNotification({ type: "error", message: uploadAssets.result.description || "آپلود مدارک با خطا مواجه شد" });
		}
	}, [uploadAssets.result]);

	useEffect(() => {
		if (!uploadPassports.result) return;
		if (uploadPassports.result.success) {
			const urls = uploadPassports.result.data ?? [];
			setEditState((prev) => prev ? { ...prev, passports: [...prev.passports, ...urls] } : prev);
			setPassportFiles([]);
			showNotification({ type: "success", message: "آپلود پاسپورت با موفقیت انجام شد" });
		} else {
			showNotification({ type: "error", message: uploadPassports.result.description || "آپلود پاسپورت با خطا مواجه شد" });
		}
	}, [uploadPassports.result]);

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
			mfaCertificationRateId: editState.mfaCertification[key] ?? null,
			justiceCertificationRateId: editState.justiceCertification[key] ?? null,
			justiceInquiryRateIds: editState.justiceInquiries[key] ?? [],
			embassyRateIds: editState.embassies[key] ?? [],
		}));
		return { translationItemId: editState.translationItemId, languageId: editState.languageId, documents };
	}, [editState]);

	// Trigger calculation on summary step
	useEffect(() => {
		if (step === 10 && calcPayload) {
			calculation.fetchData(calcPayload);
		}
	}, [step]);

	const goNext = () => {
		if (step === 2 && editState) fetchRates(editState);
		setStep((s) => Math.min(s + 1, TOTAL_STEPS));
	};

	const goPrev = () => setStep((s) => Math.max(s - 1, 1));

	const submitUpdate = () => {
		if (!calcPayload || !editState) return;
		updateItem.fetchData({
			...calcPayload,
			passports: editState.passports,
			assets: editState.assets,
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
						<div className="flex flex-col gap-3">
							{documentKeys.map((key) => (
								<div
									key={key}
									className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-neutral-50"
								>
									<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
										<IconDocument className="fill-primary stroke-0 w-4 h-4" />
									</div>
									<div className="flex-1 text-sm font-medium text-primary">
										{editState.translationItemNames[key]}
									</div>
								</div>
							))}
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

				{/* Step 2: Language */}
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
												groupMode
												setValue={(val: Record<string, string>) =>
													setEditState((prev) =>
														prev
															? {
																	...prev,
																	baseRateCount: {
																		...prev.baseRateCount,
																		[key]: val[key] ?? "",
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
						<div className="peyda font-bold text-xl text-primary">خدمات اضافی</div>
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
											خدمات اضافی برای {editState.translationItemNames[key]}
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
								خدمات اضافی برای این ترکیب تعریف نشده است
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
																const current =
																	prev.justiceCertification[key];
																// تا وقتی مهر امور خارجه فعال است، مهر دادگستری اجباری و غیرقابل‌حذف است
																if (current && prev.mfaCertification[key]) return prev;
																return {
																	...prev,
																	justiceCertification: {
																		...prev.justiceCertification,
																		[key]: current ? null : rateId,
																	},
																};
															});
														}}
														className={`flex items-center gap-3 p-4 border rounded-lg duration-200 ${
															editState.mfaCertification[key]
																? "cursor-not-allowed"
																: "cursor-pointer"
														} ${
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
															{editState.mfaCertification[key] && (
																<span
																	className={`text-[10px] leading-none whitespace-nowrap rounded-md px-1.5 py-1 ${
																		editState.justiceCertification[key]
																			? "bg-white/20 text-white"
																			: "bg-neutral-100 text-neutral-500"
																	}`}
																>
																	الزامی
																</span>
															)}
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
																	return {
																		...prev,
																		mfaCertification: {
																			...prev.mfaCertification,
																			[key]: null,
																		},
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
							<div className="flex flex-col gap-6">
								{documentKeys.map((key) => (
									<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
										<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
											<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
											استعلام برای {editState.translationItemNames[key]}
										</div>
										<div className="flex flex-wrap gap-4">
											{justiceInquiryRates.result?.data?.data?.map(
												(inquiry, index) => {
													const isSelected = (
														editState.justiceInquiries[key] ?? []
													).includes(inquiry.justiceInquiryRateId);
													return (
														<motion.div
															key={inquiry.justiceInquiryRateId}
															className="flex-1 min-w-48"
															initial={{ opacity: 0, y: 8 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ delay: index * 0.04 }}
														>
															<div
																onClick={() => {
																	setEditState((prev) => {
																		if (!prev) return prev;
																		const current =
																			prev.justiceInquiries[
																				key
																			] ?? [];
																		const updated = isSelected
																			? current.filter(
																					(id) =>
																						id !==
																						inquiry.justiceInquiryRateId
																				)
																			: [
																					...current,
																					inquiry.justiceInquiryRateId,
																				];
																		return {
																			...prev,
																			justiceInquiries: {
																				...prev.justiceInquiries,
																				[key]: updated,
																			},
																		};
																	});
																}}
																className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer duration-200 ${
																	isSelected
																		? "bg-secondary border-secondary"
																		: "border-neutral-300 hover:bg-secondary/10"
																}`}
															>
																<IconInquiry
																	width={32}
																	height={32}
																	viewBox="0 0 1024 1024"
																	className={`shrink-0 ${
																		isSelected
																			? "fill-white stroke-0"
																			: "fill-primary stroke-0"
																	}`}
																/>
																<span
																	className={`peyda font-semibold text-sm ${
																		isSelected ? "text-white" : ""
																	}`}
																>
																	{inquiry.justiceInquiryName}
																</span>
															</div>
														</motion.div>
													);
												}
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">
								استعلامی برای این ترکیب تعریف نشده است
							</div>
						)}
					</div>
				)}

				{/* Step 7: Embassy approvals */}
					{step === 7 && (
						<div className="flex flex-col gap-4">
							<div className="peyda font-bold text-xl text-primary">تایید سفارت</div>
							{embassyRates.loading && !embassyRates.result ? (
								<div className="flex justify-center py-8">
									<TabanLoading size={24} />
								</div>
							) : embassyRates.result?.success && (embassyRates.result.data?.data?.length ?? 0) > 0 ? (
								<div className="flex flex-col gap-6">
									{documentKeys.map((key) => (
										<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
											<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
												<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
												تایید سفارت برای {editState.translationItemNames[key]}
											</div>
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
																<IconEmbassy viewBox="0 0 50 64"  width={32} height={32} className={`shrink-0 ${isSelected ? "stroke-white stroke-" : "stroke-primary stroke-2"}`} />
																<span className={`peyda font-semibold text-sm ${isSelected ? "text-white" : ""}`}>{embassy.embassyName}</span>
															</div>
														</motion.div>
													);
												})}
											</div>
										</div>
									))}
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
						<FileUploader
							files={assetFiles}
							onChange={setAssetFiles}
							uploadedUrls={editState.assets}
							onRemoveUploaded={(url) =>
								setEditState((prev) =>
									prev ? { ...prev, assets: prev.assets.filter((u) => u !== url) } : prev
								)
							}
							multiple
							accept="image/*,.pdf"
							allowedExtensions={["PDF", "JPG", "PNG"]}
							hint="مدارک خود را اینجا رها کنید یا برای انتخاب کلیک کنید"
							isLoading={uploadAssets.loading}
						/>
						{assetFiles.length > 0 && (
							<div className="flex justify-end">
								<TabanButton
									onClick={() => uploadAssets.fetchData(assetFiles)}
									isLoading={uploadAssets.loading}
									disabled={uploadAssets.loading}
									icon={
										<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-white" />
									}
								>
									آپلود مدارک
								</TabanButton>
							</div>
						)}
					</div>
				)}

				{/* Step 9: Upload passport */}
				{step === 9 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">آپلود تصویر پاسپورت</div>
						<FileUploader
							files={passportFiles}
							onChange={setPassportFiles}
							uploadedUrls={editState.passports}
							onRemoveUploaded={(url) =>
								setEditState((prev) =>
									prev
										? { ...prev, passports: prev.passports.filter((u) => u !== url) }
										: prev
								)
							}
							multiple
							accept="image/*,.pdf"
							allowedExtensions={["PDF", "JPG", "PNG"]}
							hint="تصویر پاسپورت خود را اینجا رها کنید یا برای انتخاب کلیک کنید"
							isLoading={uploadPassports.loading}
						/>
						{passportFiles.length > 0 && (
							<div className="flex justify-end">
								<TabanButton
									onClick={() => uploadPassports.fetchData(passportFiles)}
									isLoading={uploadPassports.loading}
									disabled={uploadPassports.loading}
									icon={
										<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-white" />
									}
								>
									آپلود پاسپورت
								</TabanButton>
							</div>
						)}
					</div>
				)}

				{/* Step 10: Summary */}
				{step === 10 && (
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
										<div className="flex justify-between text-sm py-1">
											<span>
												مالیات ({bd.summary.taxPercent}٪):
											</span>
											<span className="font-semibold">
												{toCurrency(bd.summary.taxPrice)} تومان
											</span>
										</div>
										<div className="h-px bg-neutral-100 my-1" />
										<div className="flex justify-between font-bold py-1">
											<span>مبلغ کل سفارش:</span>
											<span className="text-lg text-primary">
												{toCurrency(bd.summary.totalPrice)} تومان
											</span>
										</div>
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
					<TabanButton onClick={goNext} icon={<IconArrowLine />}>
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
