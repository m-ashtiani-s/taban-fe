"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { useApi } from "@/hooks/useApi";
import { AddDocumentToCartPayload } from "@/types/cart.type";
import { RateCalculationDocumentInput, RateCalculationRequest } from "@/types/rateCalculation.type";
import { RateFilters } from "@/types/rateFilters.type";
import { toCurrency, assetFolderName, generateUUID } from "@/utils/string";
import { useProfiletore } from "@/stores/profile";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import UploadBox from "@/app/_components/common/uploadBox/uploadBox";
import PassportPicker from "@/app/_components/common/passportPicker/passportPicker";
import { useNotificationStore } from "@/stores/notification.store";
import {
	IconArrowLine,
	IconDocument,
	IconEmbassy,
	IconInquiry,
	IconJustice,
	IconMfa,
	IconRequired,
	IconTranslate,
} from "@/app/_components/icon/icons";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { OrderEndpoints } from "../../../_api/endpoint";
import { OrderedDoc } from "../../../_types/order.type";

const TOTAL_STEPS = 11;

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
	copyCount: Record<string, string>;
	passports: string[];
	assetsByDoc: Record<string, string[]>;
};

function buildInitialState(doc: OrderedDoc): EditState {
	const { payload, breakdown } = doc;
	const translationItemNames: Record<string, string> = {};
	const baseRateCount: Record<string, string> = {};
	const specialItems: Record<string, Record<string, string>> = {};
	const mfaCertification: Record<string, string | null> = {};
	const justiceCertification: Record<string, string | null> = {};
	const justiceInquiries: Record<string, string[]> = {};
	const embassies: Record<string, string[]> = {};
	const copyCount: Record<string, string> = {};
	const assetsByDoc: Record<string, string[]> = {};

	payload.documents.forEach((d) => {
		translationItemNames[d.documentKey] = d.title;
		baseRateCount[d.documentKey] = d.baseRateCount.toString();
		specialItems[d.documentKey] = {};
		d.specials.forEach((s) => {
			specialItems[d.documentKey][s.dynamicRateId] = s.count.toString();
		});
		mfaCertification[d.documentKey] = d.mfaCertificationRateId ?? null;
		justiceCertification[d.documentKey] = d.justiceCertificationRateId ?? null;
		justiceInquiries[d.documentKey] = d.justiceInquiryRateIds ?? [];
		embassies[d.documentKey] = d.embassyRateIds ?? [];
		copyCount[d.documentKey] = (d.copyCount ?? 1).toString();
		assetsByDoc[d.documentKey] = d.assets ?? [];
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
		embassies,
		copyCount,
		passports: payload.passports ?? [],
		assetsByDoc,
	};
}

export default function OrderItemEditPage() {
	const params = useParams();
	const router = useRouter();
	const orderId = params?.orderId as string;
	const cartItemId = params?.cartItemId as string;
	const backHref = `/profile/orders/${orderId}`;
	const showNotification = useNotificationStore((s) => s.showNotification);
	const profile = useProfiletore((s) => s.profile);
	// ریشه‌ی پوشه‌ی آپلود: شناسه‌ی کاربر واردشده (در این صفحه همیشه موجود است)
	const fallbackUploadScope = useMemo(() => generateUUID(), []);
	const uploadScope = profile?.userId || fallbackUploadScope;

	const [step, setStep] = useState(1);
	const [editState, setEditState] = useState<EditState | null>(null);
	const [notFound, setNotFound] = useState(false);

	const getOrder = useApi(async () => await OrderEndpoints.getOrder(orderId), true);
	const languages = useApi(async () => await TranslationEndpoints.getLanguages(), true);
	const baseRate = useApi(async (filters: RateFilters) => await TranslationEndpoints.getBaseRate(filters));
	const dynamicRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getDynamicRates(filters));
	const certificationRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getCertificationRates(filters));
	const justiceInquiryRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getJusticeInquiriesRates(filters));
	const embassyRates = useApi(async (filters: RateFilters) => await TranslationEndpoints.getEmbassyRates(filters));
	const translationItem = useApi(async (id: string) => await TranslationEndpoints.getTranslationItem(id));
	const calculation = useApi(async (payload: RateCalculationRequest) => await TranslationEndpoints.calculateRate(payload));
	const updateItem = useApi(async (payload: AddDocumentToCartPayload) => await OrderEndpoints.updateOrderItem(orderId, cartItemId, payload));

	useEffect(() => {
		getOrder.fetchData();
		languages.fetchData();
	}, []);

	useEffect(() => {
		if (getOrder.result?.success) {
			const order = getOrder.result.data?.data ?? null;
			const found = order?.orderedDocs?.find((it) => it.cartItemId === cartItemId);
			if (found) {
				setEditState(buildInitialState(found));
			} else {
				setNotFound(true);
			}
		}
	}, [getOrder.result]);

	// واکشی توضیحات آپلود مدرک (که ادمین نوشته) برای نمایش در مرحله‌ی آپلود
	useEffect(() => {
		if (editState?.translationItemId) translationItem.fetchData(editState.translationItemId);
	}, [editState?.translationItemId]);

	const fetchRates = (state: EditState) => {
		const filters: RateFilters = { translationItemId: state.translationItemId, languageId: state.languageId };
		baseRate.fetchData(filters);
		dynamicRates.fetchData(filters);
		certificationRates.fetchData(filters);
		justiceInquiryRates.fetchData(filters);
		embassyRates.fetchData(filters);
	};

	useEffect(() => {
		if (!updateItem.result) return;
		if (updateItem.result.success) {
			showNotification({ type: "success", message: "آیتم سفارش با موفقیت بروزرسانی شد" });
			router.push(backHref);
		} else {
			showNotification({ type: "error", message: updateItem.result.description ?? "بروزرسانی آیتم سفارش با خطا مواجه شد" });
		}
	}, [updateItem.result]);

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
			justiceInquiryRateIds: editState.justiceCertification[key] ? (editState.justiceInquiries[key] ?? []) : [],
			embassyRateIds: editState.embassies[key] ?? [],
			copyCount: Number(editState.copyCount[key] ?? 1) || 1,
			assets: editState.assetsByDoc[key] ?? [],
		}));
		return { translationItemId: editState.translationItemId, languageId: editState.languageId, documents };
	}, [editState]);

	useEffect(() => {
		if (step === 11 && calcPayload) calculation.fetchData(calcPayload);
	}, [step]);

	const goNext = () => {
		if (step === 2 && editState) fetchRates(editState);
		setStep((s) => Math.min(s + 1, TOTAL_STEPS));
	};
	const goPrev = () => setStep((s) => Math.max(s - 1, 1));

	const submitUpdate = () => {
		if (!calcPayload || !editState) return;
		updateItem.fetchData({ ...calcPayload, passports: editState.passports, assets: Object.values(editState.assetsByDoc).flat() });
	};

	if (!editState && !notFound && (getOrder.loading || !getOrder.result)) {
		return (
			<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
				<TabanLoading size={24} />
				در حال بارگذاری اطلاعات سفارش...
			</div>
		);
	}

	if (!editState && !!getOrder.result && !getOrder.result.success && isRetryAble(getOrder.result.code)) {
		return (
			<div className="flex justify-center mt-4">
				<ErrorComponent executeFunction={() => getOrder.fetchData()} callAble errorText="دریافت اطلاعات سفارش با خطا مواجه شد" />
			</div>
		);
	}

	if (!editState) {
		return (
			<div className="flex flex-col items-center gap-4 py-16">
				<div className="text-neutral-500 text-sm">آیتم سفارش مورد نظر یافت نشد</div>
				<Link href={backHref}>
					<TabanButton>بازگشت به سفارش</TabanButton>
				</Link>
			</div>
		);
	}

	const documentKeys = Object.keys(editState.translationItemNames);
	const uploadDescription = (translationItem.result?.success ? translationItem.result.data?.data?.uploadDescription ?? "" : "").trim();

	return (
		<div className="flex flex-col gap-4">
			<div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
				<div>
					<div className="peyda font-bold text-primary">ویرایش آیتم سفارش</div>
					<div className="text-xs text-neutral-500">
						{editState.translationItemTitle} · {editState.languageName}
					</div>
				</div>
				<div className="flex items-center gap-1.5 flex-wrap">
					{Array.from({ length: TOTAL_STEPS }).map((_, i) => (
						<div
							key={i}
							className={`h-2 rounded-full duration-300 ${
								i + 1 === step ? "w-6 bg-primary" : i + 1 < step ? "w-3 bg-primary/40" : "w-3 bg-neutral-200"
							}`}
						/>
					))}
				</div>
				<div className="text-sm text-neutral-500 peyda">
					مرحله {step} از {TOTAL_STEPS}
				</div>
			</div>

			<div className="bg-white border border-neutral-200 rounded-2xl p-5 min-h-80">
				{step === 1 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">اطلاعات مدارک</div>
						<div className="flex flex-col gap-3">
							{documentKeys.map((key) => (
								<div key={key} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-neutral-50">
									<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
										<IconDocument className="fill-primary stroke-0 w-4 h-4" />
									</div>
									<div className="flex-1 text-sm font-medium text-primary">{editState.translationItemNames[key]}</div>
								</div>
							))}
						</div>
						<div className="text-sm bg-secondary/10 border border-secondary/20 text-primary p-3 rounded-lg flex items-center gap-2">
							<IconTranslate stroke="#1a3047" strokeWidth={0} className="fill-primary w-4 h-4 shrink-0" />
							<span>
								نوع مدرک: <span className="font-semibold">{editState.translationItemTitle}</span>
							</span>
						</div>
					</div>
				)}

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
													prev ? { ...prev, languageId: lang.languageId, languageName: lang.languageName } : prev,
												)
											}
											className={`border rounded-lg cursor-pointer flex items-center gap-3 p-3 duration-200 min-w-36 ${
												editState.languageId === lang.languageId ? "bg-secondary border-secondary" : "border-neutral-300 hover:bg-secondary/10"
											}`}
										>
											<Image width={28} height={28} alt="" src={`/images/languages/${lang.languageCode}.png`} />
											<span className={`peyda font-semibold text-sm ${editState.languageId === lang.languageId ? "text-white" : ""}`}>
												{lang.languageName}
											</span>
										</div>
									</motion.div>
								))}
							</div>
						) : languages.result && !languages.result.success && isRetryAble(languages.result.code) ? (
							<ErrorComponent executeFunction={() => languages.fetchData()} callAble errorText="دریافت لیست زبان‌ها با خطا مواجه شد" />
						) : null}
					</div>
				)}

				{step === 3 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">نرخ پایه ترجمه</div>
						{baseRate.loading && !baseRate.result ? (
							<div className="flex justify-center py-8">
								<TabanLoading size={24} />
							</div>
						) : baseRate.result?.success && (baseRate.result.data?.data?.length ?? 0) > 0 ? (
							<div className="flex flex-col gap-6">
								{documentKeys.map((key) => (
									<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
										<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
											<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
											{baseRate.result?.data?.data?.[0]?.title} برای {editState.translationItemNames[key]}
										</div>
										<div className="w-64">
											<TabanInput
												isNumber
												type="number"
												value={editState.baseRateCount[key] ?? ""}
												groupMode
												setValue={(val: Record<string, string>) =>
													setEditState((prev) =>
														prev ? { ...prev, baseRateCount: { ...prev.baseRateCount, [key]: val[key] ?? "" } } : prev,
													)
												}
												name={key}
											/>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">نرخ پایه‌ای برای این ترکیب تعریف نشده است</div>
						)}
					</div>
				)}

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
												<motion.div key={rate.dynamicRateId} className="w-48" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
													<div className="flex flex-col gap-1.5">
														<div className="text-sm font-semibold text-neutral-600">{rate.label}</div>
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
												</motion.div>
											))}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">خدمات اضافی برای این ترکیب تعریف نشده است</div>
						)}
					</div>
				)}

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
									const rateId = certificationRates.result?.data?.data?.[0]?.certificationRateId ?? null;
									return (
										<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
											<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
												<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
												تاییدات برای {editState.translationItemNames[key]}
											</div>
											<div className="flex flex-wrap gap-4">
												<motion.div className="flex-1 min-w-48" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
													<div
														onClick={() => {
															setEditState((prev) => {
																if (!prev) return prev;
																const current = prev.justiceCertification[key];
																// تا وقتی مهر امور خارجه فعال است، مهر دادگستری اجباری و غیرقابل‌حذف است
																if (current && prev.mfaCertification[key]) return prev;
																return { ...prev, justiceCertification: { ...prev.justiceCertification, [key]: current ? null : rateId } };
															});
														}}
														className={`flex items-center gap-3 p-4 border rounded-lg duration-200 ${
															editState.mfaCertification[key] ? "cursor-not-allowed" : "cursor-pointer"
														} ${
															editState.justiceCertification[key] ? "bg-secondary border-secondary" : "border-neutral-300 hover:bg-secondary/10"
														}`}
													>
														<IconJustice
															width={36}
															height={36}
															viewBox="0 0 48 48"
															className={`shrink-0 ${editState.justiceCertification[key] ? "fill-white stroke-0" : "fill-primary stroke-0"}`}
														/>
														<div className="flex items-center gap-2">
															<span className={`peyda font-semibold ${editState.justiceCertification[key] ? "text-white" : ""}`}>مهر دادگستری</span>
															{editState.mfaCertification[key] && (
																<span className={`text-[10px] leading-none whitespace-nowrap rounded-md px-1.5 py-1 ${editState.justiceCertification[key] ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"}`}>
																	الزامی
																</span>
															)}
														</div>
													</div>
												</motion.div>

												<motion.div className="flex-1 min-w-48" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
													<div
														onClick={() => {
															setEditState((prev) => {
																if (!prev) return prev;
																const current = prev.mfaCertification[key];
																if (current) {
																	return { ...prev, mfaCertification: { ...prev.mfaCertification, [key]: null } };
																}
																// انتخاب مهر امور خارجه، مهر دادگستری را هم اجباراً فعال می‌کند
																return {
																	...prev,
																	mfaCertification: { ...prev.mfaCertification, [key]: rateId },
																	justiceCertification: { ...prev.justiceCertification, [key]: prev.justiceCertification[key] ?? rateId },
																};
															});
														}}
														className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer duration-200 ${
															editState.mfaCertification[key] ? "bg-secondary border-secondary" : "border-neutral-300 hover:bg-secondary/10"
														}`}
													>
														<IconMfa width={36} height={36} className={`shrink-0 ${editState.mfaCertification[key] ? "!stroke-white" : "stroke-primary"}`} />
														<span className={`peyda font-semibold ${editState.mfaCertification[key] ? "text-white" : ""}`}>مهر وزارت امور خارجه</span>
													</div>
												</motion.div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">تاییداتی برای این ترکیب تعریف نشده است</div>
						)}
					</div>
				)}

				{step === 6 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">استعلام‌های ترجمه</div>
						{justiceInquiryRates.loading && !justiceInquiryRates.result ? (
							<div className="flex justify-center py-8">
								<TabanLoading size={24} />
							</div>
						) : justiceInquiryRates.result?.success && (justiceInquiryRates.result.data?.data?.length ?? 0) > 0 ? (
							<div className="flex flex-col gap-6">
								{documentKeys.map((key) => {
									const inqAllowed = !!editState.justiceCertification[key];
									return (
										<div key={key} className="border-b border-dashed border-neutral-200 pb-4">
											<div className="text-base font-bold text-secondary mb-3 flex items-center gap-1.5">
												<div className="w-2.5 h-2.5 rounded bg-primary/70 rotate-45 shrink-0" />
												استعلام برای {editState.translationItemNames[key]}
											</div>
											<div className="relative">
												<div className={`flex flex-wrap gap-4 ${inqAllowed ? "" : "opacity-40 pointer-events-none select-none"}`}>
													{justiceInquiryRates.result?.data?.data?.map((inquiry, index) => {
														const isSelected = inqAllowed && (editState.justiceInquiries[key] ?? []).includes(inquiry.justiceInquiryRateId);
														return (
															<motion.div key={inquiry.justiceInquiryRateId} className="flex-1 min-w-48" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
																<div
																	onClick={() => {
																		if (!inqAllowed) return;
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
												{!inqAllowed && (
													<div className="absolute inset-0 flex items-center justify-center p-2">
														<div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-[2px] border border-secondary/40 shadow-sm rounded-2xl px-4 py-3 max-w-sm">
															<IconJustice width={26} height={26} viewBox="0 0 48 48" className="fill-secondary stroke-0 shrink-0" />
															<span className="text-xs leading-6 text-primary peyda font-semibold">برای انتخاب استعلام‌های این مدرک، ابتدا «مهر دادگستری» را در مرحله‌ی تاییدات فعال کنید</span>
														</div>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">استعلامی برای این ترکیب تعریف نشده است</div>
						)}
					</div>
				)}

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
																
																<IconEmbassy viewBox="0 0 50 64"  width={32} height={32} className={`shrink-0 ${isSelected ? "stroke-white stroke-2" : "stroke-primary stroke-2"}`} />
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
									</div>
								))}
							</div>
						</div>
					)}

				{step === 9 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">پاسپورت</div>
						<PassportPicker value={editState.passports} onChange={(urls) => setEditState((prev) => (prev ? { ...prev, passports: urls } : prev))} />
					</div>
				)}

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
												groupMode
												setValue={(val: Record<string, string>) =>
													setEditState((prev) => (prev ? { ...prev, copyCount: { ...prev.copyCount, [key]: val[key] ?? "" } } : prev))
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
									در نسخه‌های اضافه، هزینه‌ی ترجمه تغییری نمی‌کند؛ فقط هزینه‌ی تاییدات، استعلام‌ها و تایید سفارت به ازای هر نسخه دریافت می‌شود.
								</span>
							</div>
						</div>
					)}

					{step === 11 && (
					<div className="flex flex-col gap-4">
						<div className="peyda font-bold text-xl text-primary">خلاصه آیتم</div>
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
											<div key={doc.documentKey} className="border border-neutral-200 rounded-lg p-3 flex flex-col gap-2">
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
													<div className="font-semibold text-sm">{toCurrency(doc.documentTotal)} تومان</div>
												</div>
												<div className="flex flex-col gap-1 text-xs text-neutral-500">
													<div className="flex justify-between">
														<span>هزینه ترجمه</span>
														<span>{toCurrency(doc.translationTotal ?? doc.base.total + doc.specialsTotal)} تومان</span>
													</div>
													{doc.mfaCertification && (
														<div className="flex justify-between">
															<span>مهر وزارت امور خارجه</span>
															<span>{toCurrency(doc.mfaCertification.price)} تومان</span>
														</div>
													)}
													{doc.justiceCertification && (
														<div className="flex justify-between">
															<span>مهر دادگستری</span>
															<span>{toCurrency(doc.justiceCertification.price)} تومان</span>
														</div>
													)}
													{doc.embassyApprovals?.map((e) => (
														<div key={e.embassyRateId} className="flex justify-between">
															<span>{e.embassyName}</span>
															<span>{toCurrency(e.price)} تومان</span>
														</div>
													))}
													{doc.justiceInquiries.map((i) => (
														<div key={i.justiceInquiryRateId} className="flex justify-between">
															<span>{i.justiceInquiryName}</span>
															<span>{toCurrency(i.price)} تومان</span>
														</div>
													))}
												</div>
											</div>
										))}
										<div className="h-px bg-neutral-100 my-1" />
										<div className="flex justify-between font-bold py-1">
											<span>مبلغ کل آیتم:</span>
											<span className="text-lg text-primary">{toCurrency(bd.summary.totalPrice)} تومان</span>
										</div>
									</div>
								);
							})()
						) : calculation.result && !calculation.result.success ? (
							<ErrorComponent executeFunction={() => calcPayload && calculation.fetchData(calcPayload)} callAble errorText={calculation.result.description || "محاسبه نرخ با خطا مواجه شد"} />
						) : (
							<div className="text-sm text-neutral-400 py-4 text-center">اطلاعات کافی برای محاسبه نرخ وجود ندارد</div>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Link href={backHref}>
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
					<TabanButton onClick={submitUpdate} isLoading={updateItem.loading} disabled={updateItem.loading || calculation.loading}>
						ذخیره و بروزرسانی آیتم
					</TabanButton>
				)}
			</div>
		</div>
	);
}
