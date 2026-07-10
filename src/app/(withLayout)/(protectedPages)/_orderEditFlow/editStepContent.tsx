"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { RateCalculationRequest } from "@/types/rateCalculation.type";
import { toCurrency, assetFolderName } from "@/utils/string";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import UploadBox from "@/app/_components/common/uploadBox/uploadBox";
import DocumentDescriptionField from "@/app/_components/common/documentDescriptionField/documentDescriptionField";
import PassportPicker from "@/app/_components/common/passportPicker/passportPicker";
import DeliverySection from "@/app/_components/common/deliverySection/deliverySection";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import {
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
import StepHeader from "@/app/(withoutFooter)/new-order/_components/stepHeader/stepHeader";
import SelectCard from "@/app/(withoutFooter)/new-order/_components/selectCard/selectCard";
import DocumentSection from "@/app/(withoutFooter)/new-order/_components/documentSection/documentSection";
import CardsSkeleton from "@/app/(withoutFooter)/new-order/_components/cardsSkeleton/cardsSkeleton";
import { useEditFlow } from "./editFlow.context";

const SummaryRow = ({ label, value, bold }: { label: string; value: number; bold?: boolean }) => (
	<div className="flex items-center justify-between">
		<div className={`text-sm ${bold ? "peyda font-bold text-primary" : "text-neutral-500"}`}>{label}</div>
		<div className={`flex items-center gap-1 ${bold ? "peyda font-bold text-lg text-primary" : "font-semibold"}`}>
			{toCurrency(value)}
			<span className="text-xs font-normal text-neutral-400">تومان</span>
		</div>
	</div>
);

/**
 * محتوای مرحله‌ی جاریِ فلوی ویرایش. توسط `[step]/page` رندر می‌شود و مرحله را از context
 * می‌خواند؛ کلِ state و ناوبری در EditFlowLayout مدیریت می‌شود. این کامپوننت فقط UIِ همان
 * مرحله را رندر می‌کند (معادلِ کامپوننت‌های مرحله در فلوی ثبت سفارش).
 */
export default function EditStepContent() {
	const {
		editState,
		setEditState,
		rates,
		currentStep,
		summaryVariant,
		uploadScope,
		uploadDescription,
		namePlaceholder,
		wantEmbassyByDoc,
		toggleWantEmbassy,
		onSelectLanguage,
		calcPayload,
	} = useEditFlow();

	const languages = useApi(async () => await TranslationEndpoints.getLanguages(), true);
	const calculation = useApi(async (payload: RateCalculationRequest) => await TranslationEndpoints.calculateRate(payload));

	useEffect(() => {
		if (currentStep === "language") languages.fetchData();
	}, [currentStep]);

	useEffect(() => {
		if (currentStep === "checkout" && calcPayload) calculation.fetchData(calcPayload);
	}, [currentStep]);

	const documentKeys = Object.keys(editState.translationItemNames);

	if (currentStep === "naming") {
		return (
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
		);
	}

	if (currentStep === "language") {
		const list = languages.result?.success ? languages.result.data?.data ?? [] : [];
		return (
			<div className="flex flex-col gap-8">
				<StepHeader title="زبان ترجمه را انتخاب کنید" subtitle="مدارک شما به زبان انتخابی ترجمه خواهد شد" />
				{languages.loading && !languages.result ? (
					<CardsSkeleton count={6} />
				) : list.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{list.map((lang, index) => (
							<motion.div
								key={lang.languageId}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
							>
								<SelectCard
									selected={editState.languageId === lang.languageId}
									onClick={() => onSelectLanguage(lang.languageId, lang.languageName)}
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

				{editState.languageId && rates.loading && (
					<div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
						<TabanLoading size={20} />
						در حال آماده‌سازی گزینه‌های ترجمه برای زبان انتخابی...
					</div>
				)}
				{editState.languageId && rates.attempted && !rates.loading && (
					<div className="text-center text-xs text-success">گزینه‌های این زبان آماده شد، می‌توانید ادامه دهید</div>
				)}
			</div>
		);
	}

	if (currentStep === "base") {
		const baseTitle = rates.baseRate.result?.success ? rates.baseRate.result.data?.data?.[0]?.title ?? "نرخ پایه" : "نرخ پایه";
		return (
			<div className="flex flex-col gap-8">
				<StepHeader title={`${baseTitle} مدارک`} subtitle="تعداد پایه‌ی هر مدرک را برای محاسبه‌ی دقیق نرخ ترجمه وارد کنید" />
				<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
					{documentKeys.map((key, index) => (
						<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
							<div className="flex flex-col gap-2">
								<span className="text-sm text-neutral-500">{baseTitle}</span>
								<div className="w-full sm:w-72">
									<TabanInput
										isNumber
										type="number"
										value={editState.baseRateCount[key] ?? ""}
										setValue={(val: string) =>
											setEditState((prev) => (prev ? { ...prev, baseRateCount: { ...prev.baseRateCount, [key]: val ?? "" } } : prev))
										}
										name={key}
									/>
								</div>
							</div>
						</DocumentSection>
					))}
				</div>
			</div>
		);
	}

	if (currentStep === "specials") {
		const dynamicRates = rates.dynamicRates.result?.success ? rates.dynamicRates.result.data?.data ?? [] : [];
		return (
			<div className="flex flex-col gap-8">
				<StepHeader title="موارد خاص ترجمه" subtitle="در صورت نیاز، تعداد موارد خاص هر مدرک را مشخص کنید (اختیاری)" />
				<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
					{documentKeys.map((key, index) => (
						<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
								{dynamicRates.map((rate) => (
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
			</div>
		);
	}

	if (currentStep === "certifications") {
		const rateId = rates.certifications.result?.success ? rates.certifications.result.data?.data?.[0]?.certificationRateId ?? null : null;
		return (
			<div className="flex flex-col gap-8">
				<StepHeader title="مهر و تاییدات ترجمه" subtitle="در صورت نیاز، مهرهای رسمی هر مدرک را انتخاب کنید (اختیاری)" />
				<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
					{documentKeys.map((key, index) => (
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
					))}

					<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-2.5">
						<IconInfo className="stroke-amber-600 w-5 h-5 shrink-0 mt-0.5" />
						<span className="text-sm leading-7 text-amber-700">
							لازم به ذکر است که جهت اخذ تاییدات، ارائه‌ی اصل مدارک به ارگان‌های مربوطه الزامی است.
						</span>
					</div>
				</div>
			</div>
		);
	}

	if (currentStep === "inquiries") {
		const inquiryRates = rates.justiceInquiries.result?.success ? rates.justiceInquiries.result.data?.data ?? [] : [];
		const allowedKeys = documentKeys.filter((key) => !!editState.justiceCertification[key]);
		return (
			<div className="flex flex-col gap-8">
				<StepHeader title="استعلام‌های ترجمه" subtitle="در صورت نیاز به استعلام خاص، آن‌ها را برای هر مدرک انتخاب کنید (اختیاری)" />
				<div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
					{allowedKeys.length === 0 ? (
						<div className="flex items-center gap-2.5 bg-secondary/5 border border-secondary/30 rounded-2xl px-4 py-4">
							<IconJustice width={26} height={26} viewBox="0 0 48 48" className="fill-secondary stroke-0 shrink-0" />
							<span className="text-sm leading-7 text-primary peyda font-semibold">
								استعلام تنها برای مدارکی قابل انتخاب است که «مهر دادگستری» دارند. در صورت نیاز، در مرحله‌ی تاییدات مهر دادگستری را فعال کنید.
							</span>
						</div>
					) : (
						allowedKeys.map((key, index) => {
							const selfInq = !!editState.selfInquiry[key];
							return (
								<DocumentSection key={key} index={index} title={editState.translationItemNames[key] ?? "مدرک"}>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{inquiryRates.map((inquiry) => {
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
			</div>
		);
	}

	if (currentStep === "embassy") {
		const embassyRates = rates.embassies.result?.success ? rates.embassies.result.data?.data ?? [] : [];
		return (
			<div className="flex flex-col gap-8">
				<StepHeader title="تایید سفارت" subtitle="در صورت نیاز به تایید سفارت، سفارت‌های مربوط به هر مدرک را انتخاب کنید (اختیاری)" />
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
													{embassyRates.map((embassy) => {
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
			</div>
		);
	}

	if (currentStep === "upload") {
		return (
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
		);
	}

	if (currentStep === "passport") {
		return (
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
		);
	}

	if (currentStep === "copies") {
		return (
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
		);
	}

	if (currentStep === "scan") {
		const scanRate = rates.scanRates.result?.success ? rates.scanRates.result.data?.data?.[0] ?? null : null;
		return (
			<div className="flex flex-col gap-8">
				<StepHeader
					title="اسکن مدارک"
					subtitle="در صورت نیاز، می‌توانید برای هر مدرک سرویس اسکن را انتخاب کنید"
					icon={<IconDocument width={24} height={24} className="fill-current stroke-0" />}
				/>
				<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
					{documentKeys.map((key, index) => {
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
		);
	}

	if (currentStep === "checkout") {
		const isFull = summaryVariant === "full";
		return (
			<div className="flex flex-col gap-8">
				<StepHeader
					title={isFull ? "خلاصه سفارش" : "خلاصه آیتم"}
					subtitle={isFull ? "جزئیات نرخ سفارش خود را بررسی و آن را ذخیره کنید" : "جزئیات نرخ این آیتم را بررسی و آن را ذخیره کنید"}
				/>
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
										{isFull && <SummaryRow label="مبلغ ترجمه" value={bd.summary.translationPrice} />}
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
										{isFull && (
											<>
												<div className="h-[1px] w-full bg-neutral-200" />
												<SummaryRow label="مبلغ تاییدات" value={bd.summary.certificationPrice} />
												<div className="h-[1px] w-full bg-neutral-200" />
												<SummaryRow label="مبلغ استعلام‌ها" value={bd.summary.inquiryPrice} />
												<div className="h-[1px] w-full bg-neutral-200" />
												<SummaryRow label="مبلغ تایید سفارت" value={bd.summary.embassyPrice ?? 0} />
											</>
										)}
										{(bd.summary.scanPrice ?? 0) > 0 && (
											<>
												<div className="h-[1px] w-full bg-neutral-200" />
												<SummaryRow label="مبلغ اسکن مدارک" value={bd.summary.scanPrice ?? 0} />
											</>
										)}
										{isFull && bd.summary.taxPercent > 0 && (
											<>
												<div className="h-[1px] w-full bg-neutral-200" />
												<SummaryRow label={`مالیات (${bd.summary.taxPercent}٪)`} value={bd.summary.taxPrice} />
											</>
										)}
										<div className="h-[1px] w-full bg-neutral-200" />
										<SummaryRow label={isFull ? "مبلغ کل سفارش" : "مبلغ کل آیتم"} value={bd.summary.totalPrice} bold />
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
		);
	}

	return null;
}
