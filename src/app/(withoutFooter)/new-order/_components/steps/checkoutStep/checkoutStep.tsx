"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { isLoggedIn } from "@/utils/auth";
import { toCurrency } from "@/utils/string";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { IconCart, IconCheck, IconRequired, IconStar, IconTranslate } from "@/app/_components/icon/icons";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import AuthModal from "@/app/_components/common/authModal/authModal";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import DeliverySection from "@/app/_components/common/deliverySection/deliverySection";
import { useNotificationStore } from "@/stores/notification.store";
import { useCartStore } from "@/stores/cart";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { RateCalculationRequest, RateCalculationResponse } from "@/types/rateCalculation.type";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import StepHeader from "../../stepHeader/stepHeader";
import { useOrderRates } from "../../../_hooks/useOrderRates";
import { CheckoutStepProps } from "./checkoutStep.type";

const SummaryRow = ({ label, value, bold }: { label: string; value: number; bold?: boolean }) => (
	<div className="flex items-center justify-between">
		<div className={`text-sm ${bold ? "peyda font-bold text-primary" : "text-neutral-500"}`}>{label}</div>
		<div className={`flex items-center gap-1 ${bold ? "peyda font-bold text-lg text-primary" : "font-semibold"}`}>
			{toCurrency(value)}
			<span className="text-xs font-normal text-neutral-400">تومان</span>
		</div>
	</div>
);

export default function CheckoutStep({resetSteps}:CheckoutStepProps) {
	const router = useRouter();
	const { order, setOrder, resetOrder } = useNewOrderStore();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const setCart = useCartStore((state) => state.setCart);

	const [successModalOpen, setSuccessModalOpen] = useState(false);
	const [authModalOpen, setAuthModalOpen] = useState(false);

	const calculationPayload = useMemo<RateCalculationRequest | null>(() => {
		if (!order?.translationItem?.translationItemId || !order?.language?.languageId) return null;
		const documentKeys = Object.keys(order?.translationItemNames ?? {});
		if (documentKeys.length === 0) return null;

		const documents = documentKeys.map((key) => {
			const specials =
				order?.specialItems
					?.find((s) => s?.translationItemId === key)
					?.specials?.map((sp) => ({ dynamicRateId: sp.dynamicRateId, count: sp.count })) ?? [];

			const mfa = order?.mfaCertification?.find((m) => m?.translationItemId === key)?.mfaCertification ?? null;
			const justice = order?.justiceCertification?.find((j) => j?.translationItemId === key)?.justiceCertification ?? null;
			const selfInquiry = !!order?.selfInquiryByDoc?.[key];

			const inquiries =
				justice && !selfInquiry
						? order?.justiceInquiriesItems?.find((j) => j?.translationItemId === key)?.justiceInquiries?.map((i) => i.justiceInquiryRateId) ?? []
						: [];

			return {
				documentKey: key,
				title: order?.translationItemNames?.[key] ?? "",
				baseRateCount: Number(order?.baseRateCount?.[key] ?? 1) || 1,
					copyCount: Number(order?.copyCount?.[key] ?? 1) || 1,
				specials,
				mfaCertificationRateId: mfa?.certificationRateId ?? null,
				justiceCertificationRateId: justice?.certificationRateId ?? null,
				justiceInquiryRateIds: inquiries,
					embassyRateIds:
						justice && mfa
							? order?.embassyItems?.find((e) => e?.translationItemId === key)?.embassies?.map((e) => e.embassyRateId) ?? []
							: [],
					scanRateId: order?.scanRateIdByDoc?.[key] ?? null,
					assets: order?.assetsByDoc?.[key] ?? [],
					selfInquiry,
					description: order?.descriptionByDoc?.[key]?.trim() || undefined,
			};
		});

		return {
			translationItemId: order.translationItem.translationItemId,
			languageId: order.language.languageId,
			documents,
			isOfficial: order.isOfficial !== false,
		};
	}, [order]);

	const calculation = useApi(async (payload: RateCalculationRequest) => await TranslationEndpoints.calculateRate(payload), true);
	const addToCart = useApi(async () => {
		if (!calculationPayload) throw new Error("اطلاعات کافی برای افزودن به سبد خرید وجود ندارد");
		return await CartEndpoints.addToCart({
			...calculationPayload,
			passports: order?.passports ?? [],
			assets: Object.values(order?.assetsByDoc ?? {}).flat(),
			customerId: order?.customerId ?? null,
			desiredDeliveryDate: order?.desiredDeliveryDate ?? null,
		});
	});

	useEffect(() => {
		if (calculationPayload) {
			calculation.fetchData(calculationPayload);
		}
	}, [calculationPayload]);

	useEffect(() => {
		if (addToCart.result) {
			if (addToCart.result.success) {
				const cart = addToCart.result.data?.data ?? null;
				if (cart) setCart(cart);
				setSuccessModalOpen(true);
			} else {
				showNotification({ type: "error", message: addToCart.result.description ?? "افزودن به سبد خرید با خطا مواجه شد" });
			}
		}
	}, [addToCart.result]);

	const breakdown: RateCalculationResponse | null = calculation.result?.success ? calculation.result.data?.data ?? null : null;

	const handleSuccessModalClose = () => {
		setSuccessModalOpen(false);
		resetOrder();
		resetSteps()
	};

	const closeAndGoToCart = ()=>{
		handleSuccessModalClose()
		router.push("/cart");
	}
	const closeAndGoToHome = ()=>{
		handleSuccessModalClose()
		router.push("/");
	}
	const closeAndGoToNewOrder = ()=>{
		handleSuccessModalClose()
		router.push("/new-order");
	}

	const handleAddToCart = () => {
		if (!breakdown) return;
		if (isLoggedIn()) addToCart.fetchData();
		else setAuthModalOpen(true);
	};

	return (
		<>
			<AuthModal
				open={authModalOpen}
				setOpen={setAuthModalOpen}
				title="ورود برای ثبت سفارش"
				description="برای افزودن ترجمه به سبد خرید، وارد حساب خود شوید یا ثبت‌نام کنید"
				onSuccess={() => addToCart.fetchData()}
			/>

			<TabanModal width={700} open={successModalOpen} setOpen={setSuccessModalOpen} title="سفارش با موفقیت ثبت شد" onClose={handleSuccessModalClose}>
				<div className="flex flex-col items-center gap-6 py-4">
					<div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
						<IconCheck className="stroke-success w-10 h-10" />
					</div>
					<div className="text-center">
						<div className="peyda font-bold text-xl text-primary mb-2">سفارش ترجمه‌ات ثبت شد!</div>
						<div className="text-sm text-neutral-500 leading-7">ترجمه‌ات با موفقیت به سبد خریدت اضافه شد. ادامه مسیرت رو مشخص کن</div>
					</div>
					<div className="flex gap-3 w-full justify-center flex-wrap">
						<TabanButton  className="justify-center" onClick={closeAndGoToCart}>
							<IconCart className="stroke-white w-5 h-5 ml-2" />
							تسویه و ثبت نهایی
						</TabanButton>
						<TabanButton variant="bordered" className="justify-center" onClick={closeAndGoToNewOrder}>
							<IconTranslate stroke="currentColor" strokeWidth={0} className="fill-primary w-5 h-5 ml-2" />
							ثبت ترجمه جدید
						</TabanButton>
						<TabanButton variant="bordered" className="justify-center" onClick={closeAndGoToHome}>
							بازگشت به خانه
						</TabanButton>
					</div>
				</div>
			</TabanModal>

			<div className="flex flex-col gap-8">
				<StepHeader title="خلاصه و پرداخت سفارش" subtitle="جزئیات نرخ سفارش خود را بررسی و آن را به سبد خرید اضافه کنید" />

				<div className="max-w-3xl mx-auto w-full">
					{calculation.loading && !breakdown ? (
						<div className="flex items-center gap-2 justify-center py-16">
							<TabanLoading size={24} />
							<span className="text-sm text-neutral-500">در حال محاسبه نرخ سفارش...</span>
						</div>
					) : breakdown ? (
						<div className="flex flex-col gap-5">
							<div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-5 flex flex-col gap-3">
								<div className="flex items-center justify-between text-sm">
									<span className="text-neutral-500">مدرک ترجمه</span>
									<div className="flex items-center gap-2">
										<span className="peyda font-semibold text-primary">{breakdown.translationItemTitle}</span>
										{breakdown.documents.length > 1 && (
											<span className="text-[11px] text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded">
												× {convertToPersianNumber(String(breakdown.documents.length))}
											</span>
										)}
									</div>
								</div>
								<div className="h-[1px] w-full bg-neutral-200" />
								<div className="flex items-center justify-between text-sm">
									<span className="text-neutral-500">زبان ترجمه</span>
									<span className="peyda font-semibold text-primary">{breakdown.languageName}</span>
								</div>
							</div>

							{/* <div className="flex flex-col gap-3">
								{breakdown.documents.map((doc) => (
									<div key={doc.documentKey} className="rounded-2xl border border-neutral-200 p-4 flex flex-col gap-2.5">
										<div className="flex items-center justify-between pb-2 border-b border-dashed border-neutral-200">
											<div className="flex items-center gap-1.5 peyda font-bold text-secondary text-sm">
												<span className="w-2 h-2 rounded-sm bg-secondary rotate-45" />
												{doc.title}
											</div>
											<div className="flex items-center gap-1 peyda font-semibold text-primary text-sm">
												{toCurrency(doc.documentTotal)}
												<span className="text-xs font-normal text-neutral-400">تومان</span>
											</div>
										</div>
										<div className="flex flex-col gap-1.5 text-xs text-neutral-500">
											<div className="flex items-center justify-between">
												<span>
													{doc.base.title || "نرخ پایه"} × {doc.base.count}
												</span>
												<span>{toCurrency(doc.base.total)} تومان</span>
											</div>
											{doc.specials.map((s) => (
												<div key={s.dynamicRateId} className="flex items-center justify-between">
													<span>
														{s.label} × {s.count}
													</span>
													<span>{toCurrency(s.total)} تومان</span>
												</div>
											))}
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
											{doc.justiceInquiries.map((i) => (
												<div key={i.justiceInquiryRateId} className="flex items-center justify-between">
													<span>{i.justiceInquiryName}</span>
													<span>{toCurrency(i.price)} تومان</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div> */}

							<div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-5 flex flex-col gap-3">
								<SummaryRow label="مبلغ ترجمه" value={breakdown.summary.translationPrice} />
								{!!breakdown.summary.tierDiscountPercent && breakdown.summary.tierDiscountPercent > 0 && (
									<div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 -mt-1">
										<div className="flex items-center gap-2 text-sm text-emerald-700">
											<IconStar className="fill-emerald-500 stroke-0 w-4 h-4" />
											<span>تخفیف باشگاه مشتریان ({breakdown.summary.tierDiscountPercent.toString()}٪)</span>
										</div>
										<div className="flex items-center gap-1 font-semibold text-emerald-700">
											{toCurrency(breakdown.summary.tierDiscountAmount ?? 0)}-
											<span className="text-xs font-normal text-emerald-500">تومان</span>
										</div>
									</div>
								)}
								<div className="h-[1px] w-full bg-neutral-200" />
								<SummaryRow label="مبلغ تاییدات ترجمه" value={breakdown.summary.certificationPrice} />
								<div className="h-[1px] w-full bg-neutral-200" />
								<SummaryRow label="مبلغ استعلام‌های ترجمه" value={breakdown.summary.inquiryPrice} />
								{breakdown.documents.some((d) => d.justiceInquiries.length > 0) && (
									<div className="flex flex-col gap-1 pr-3 -mt-1">
										{breakdown.documents
											.flatMap((d) => d.justiceInquiries)
											.map((inq, idx) => (
												<div key={idx} className="flex items-center justify-between text-xs text-neutral-500">
													<span>{inq.justiceInquiryName}</span>
													<span>{toCurrency(inq.price)} تومان</span>
												</div>
											))}
									</div>
								)}
								<div className="h-[1px] w-full bg-neutral-200" />
								<SummaryRow label="مبلغ تایید سفارت" value={breakdown.summary.embassyPrice ?? 0} />
								{(breakdown.summary.scanPrice ?? 0) > 0 && (
									<>
										<div className="h-[1px] w-full bg-neutral-200" />
										<SummaryRow label="مبلغ اسکن مدارک" value={breakdown.summary.scanPrice ?? 0} />
									</>
								)}
								<div className="h-[1px] w-full bg-neutral-200" />
								{breakdown.summary.taxPercent > 0 && (
									<>
								<SummaryRow label="جمع جزء" value={breakdown.summary.subtotal} />
								<div className="h-[1px] w-full bg-neutral-200" />
								<SummaryRow label={`مالیات (${breakdown.summary.taxPercent.toString()}٪)`} value={breakdown.summary.taxPrice} />
								<div className="h-[1px] w-full bg-neutral-200" />
									</>
								)}
								<SummaryRow label="مبلغ کل ترجمه" value={breakdown.summary.totalPrice} bold />

								<div className="flex items-start gap-2 text-xs text-neutral-500 bg-neutral-100/60 border border-neutral-200 rounded-xl p-3 mt-1">
									<IconRequired viewBox="0 0 100 100" width={14} height={14} className="fill-secondary stroke-0 shrink-0 mt-0.5" />
									<span className="leading-6">
										کد تخفیف رو می‌تونی بعد از افزودن به سبد خرید، توی سبد خرید اعمال کنی.
									</span>
								</div>
							</div>

							<DeliverySection
								hasJustice={breakdown.documents.some((d) => !!d.justiceCertification)}
								hasMfa={breakdown.documents.some((d) => !!d.mfaCertification)}
								desiredDate={order?.desiredDeliveryDate ?? null}
								onDateChange={(d) => setOrder((prev) => ({ ...prev, desiredDeliveryDate: d }))}
							/>

							<div className="flex items-center justify-end">
								<TabanButton onClick={handleAddToCart} isLoading={addToCart.loading} disabled={addToCart.loading || !breakdown}>
									<IconCart className="stroke-white w-5 h-5 ml-2" />
									افزودن به سبد خرید
								</TabanButton>
							</div>
						</div>
					) : !!calculation.result && !calculation.result.success && isRetryAble(calculation.result.code) ? (
						<div className="flex justify-center mt-4">
							<ErrorComponent
								executeFunction={() => calculationPayload && calculation.fetchData(calculationPayload)}
								callAble
								errorText={calculation.result.description || "محاسبه نرخ با خطا مواجه شد"}
							/>
						</div>
					) : !!calculation.result && !calculation.result.success ? (
						<div className="flex items-center justify-center py-12 text-sm text-error">
							<IconRequired viewBox="0 0 100 100" width={20} height={20} className="fill-error stroke-0 ml-2" />
							{calculation.result.description || "محاسبه نرخ با خطا مواجه شد"}
						</div>
					) : (
						<div className="flex items-center justify-center py-12 text-sm text-neutral-400">اطلاعات کافی برای محاسبه نرخ وجود ندارد</div>
					)}
				</div>
			</div>
		</>
	);
}
