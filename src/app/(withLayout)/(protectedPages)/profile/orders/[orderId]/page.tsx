"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { toCurrency } from "@/utils/string";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { formatJalaliDate } from "@/utils/dateFormater";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import {
	IconArrow,
	IconCalendar,
	IconCheck,
	IconClose,
	IconCopy,
	IconCross,
	IconDocument,
	IconEdit,
	IconEye,
	IconGuarantee,
	IconInfo,
	IconMoney,
	IconOrder,
	IconTranslate,
	IconTruck,
	IconUpload,
	IconUser,
} from "@/app/_components/icon/icons";
import { svgIcon } from "@/app/_components/icon/icon.types";
import { OrderEndpoints } from "../_api/endpoint";
import { Order, OrderCustomerInfo, OrderedDoc, OrderShippingAddressInfo, OrderStatus } from "../_types/order.type";
import { guideToneClasses, orderFlowSteps, orderStatusGuide, orderStatusMeta, paymentStatusMeta } from "../_constants/orderStatus";
import axios from "axios";
import { API_URL } from "@/config/global";
import { storage } from "@/types/Storage";
import { StorageKey } from "@/types/StorageKey";

const statusGuideIcon: Record<OrderStatus, React.FC<svgIcon>> = {
	document_submission: IconInfo,
	approved: IconMoney,
	paid: IconCheck,
	admin_registration: IconEdit,
	translating: IconTranslate,
	documents_received: IconUpload,
	reviewing: IconEye,
	certifications: IconGuarantee,
	ready_for_delivery: IconCheck,
	translation_scan: IconCopy,
	documents_sent: IconTruck,
	delivered: IconCheck,
	needs_editing: IconCross,
};

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
	const router = useRouter();
	const showNotification = useNotificationStore((s) => s.showNotification);
	const { result, resultData, fetchData, loading } = useApi(async (id: string) => await OrderEndpoints.getOrder(id), true);
	const pay = useApi(async (id: string) => await OrderEndpoints.payOrder(id));
	const removeCoupon = useApi(async (id: string) => await OrderEndpoints.removeCoupon(id));
	const [removeCouponModalOpen, setRemoveCouponModalOpen] = useState<boolean>(false);
	const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);

	useEffect(() => {
		fetchData(params.orderId);
	}, []);

	// TODO: موقت — تا قبل از اتصال درگاه پرداخت واقعی، فقط وضعیت سفارش را پرداخت‌شده می‌کند.
	const payHandler = async () => {
		const res = await pay.fetchDataResult(params.orderId);
		if (res.success) {
			showNotification({ type: "success", message: res.data?.message ?? "پرداخت با موفقیت انجام شد" });
			fetchData(params.orderId);
		} else {
			showNotification({ type: "error", message: res.description ?? "پرداخت با خطا مواجه شد" });
		}
	};

	const removeCouponHandler = async () => {
		const res = await removeCoupon.fetchDataResult(params.orderId);
		if (res.success) {
			showNotification({ type: "success", message: res.data?.message ?? "کد تخفیف از سفارش حذف شد" });
			setRemoveCouponModalOpen(false);
			fetchData(params.orderId);
		} else {
			showNotification({ type: "error", message: res.description ?? "حذف کد تخفیف با خطا مواجه شد" });
		}
	};

	const order = resultData?.data ?? null;

	if (loading && !result) {
		return (
			<div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
				<TabanLoading size={26} />
				در حال دریافت اطلاعات سفارش...
			</div>
		);
	}

	if (!!result && !result.success && isRetryAble(result.code)) {
		return (
			<div className="flex justify-center mt-4">
				<ErrorComponent executeFunction={() => fetchData(params.orderId)} callAble errorText="دریافت اطلاعات سفارش با خطا مواجه شد" />
			</div>
		);
	}

	if (!order) {
		return (
			<div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
				<div className="text-sm text-neutral-500">سفارش مورد نظر یافت نشد</div>
				<TabanButton variant="bordered" isLink href="/profile/orders">
					بازگشت به سفارش‌ها
				</TabanButton>
			</div>
		);
	}

	const meta = orderStatusMeta[order.status];
	const payMeta = paymentStatusMeta[order.paymentStatus];
	const address = order.shippingAddress && typeof order.shippingAddress !== "string" ? (order.shippingAddress as OrderShippingAddressInfo) : null;
	const customer = order.customer && typeof order.customer !== "string" ? (order.customer as OrderCustomerInfo) : null;
	const editable = order.status === "document_submission" || order.status === "needs_editing";
	const couponInfo = order.coupon && typeof order.coupon !== "string" ? order.coupon : null;
	const canRemoveCoupon = !!couponInfo && (order.status === "document_submission" || order.status === "approved");
	const isPaid = order.paymentStatus === "paid";

	// دانلود فاکتور PDF — بک‌اند فایل را به‌صورت base64 می‌فرستد و اینجا به Blob تبدیل و دانلود می‌شود.
	// ارسال به‌صورت base64 باعث می‌شود دانلودرهای خارجی مثل IDM پاسخ را شنود نکنند (وگرنه بدون توکن دوباره صدا می‌زنند و ۴۰۱ می‌گیرند).
	const downloadInvoiceHandler = async () => {
		try {
			setInvoiceLoading(true);
			const file = await OrderEndpoints.downloadInvoice(order.orderId);
			if (!file?.base64) throw new Error("invalid invoice response");
			const byteChars = window.atob(file.base64);
			const bytes = new Uint8Array(byteChars.length);
			for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
			const blob = new Blob([bytes], { type: file.mimeType || "application/pdf" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = file.fileName || `invoice-${order.orderNumber}.pdf`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch {
			showNotification({ type: "error", message: "دانلود فاکتور با خطا مواجه شد" });
		} finally {
			setInvoiceLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-5">
			<TabanModal
				open={removeCouponModalOpen}
				setOpen={setRemoveCouponModalOpen}
				title="حذف کد تخفیف"
				onClose={() => setRemoveCouponModalOpen(false)}
			>
				<div className="flex flex-col gap-2">
					<div className="text-sm text-neutral-600 leading-7">
						با حذف کد تخفیف{couponInfo ? ` «${couponInfo.code}»` : ""}، مبلغ قابل پرداخت به جمع کل سفارش (
						<span className="font-semibold text-primary">{toCurrency(order.totalAmount)} تومان</span>) تغییر می‌کند. برای
						استفاده‌ی مجدد از کد تخفیف باید سفارش جدیدی ثبت کنید. ادامه می‌دهید؟
					</div>
					<div className="flex justify-end gap-3 mt-8">
						<TabanButton variant="bordered" onClick={() => setRemoveCouponModalOpen(false)} disabled={removeCoupon.loading}>
							انصراف
						</TabanButton>
						<TabanButton onClick={removeCouponHandler} isLoading={removeCoupon.loading} loadingText="در حال حذف...">
							حذف کد تخفیف
						</TabanButton>
					</div>
				</div>
			</TabanModal>

			{/* header */}
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => router.push("/profile/orders")}
						className="w-10 h-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 duration-150"
					>
						<IconArrow className="rotate-90 stroke-neutral-600 fill-neutral-600" width={20} height={20} />
					</button>
					<div>
						<div className="flex items-center gap-2 text-lg font-bold peyda text-primary">
							<IconOrder className="stroke-primary w-5 h-5" />
							سفارش #{order.orderNumber}
						</div>
						<div className="text-xs text-neutral-500 mt-0.5">{formatJalaliDate(order.createdAt, "yyyy/mm/dd hh:mm")}</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${meta.className}`}>
						<span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
						{meta.label}
					</div>
					<div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${payMeta.className}`}>
						{payMeta.label}
					</div>
				</div>
			</div>

			{/* راهنمای وضعیت سفارش */}
			<StatusGuidance order={order} onPay={payHandler} paying={pay.loading} />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
				{/* ordered docs */}
				<div className="lg:col-span-2 flex flex-col gap-4">
					{order.orderedDocs.map((doc) => (
						<OrderedDocCard
							key={doc.cartItemId}
							doc={doc}
							editable={editable}
							onEdit={() => router.push(`/profile/orders/${order.orderId}/edit/${doc.cartItemId}`)}
						/>
					))}

					{order.remarks?.trim() && (
						<div className="bg-white border border-neutral-200 rounded-2xl p-5">
							<div className="text-sm font-semibold peyda mb-2">توضیحات سفارش</div>
							<div className="text-sm text-neutral-600 leading-7">{order.remarks}</div>
						</div>
					)}
				</div>

				{/* sidebar: flow + address + totals */}
				<div className="lg:col-span-1 flex flex-col gap-4">
					{order.status !== "needs_editing" && <StatusFlow order={order} />}

					{customer && (
						<div className="relative overflow-hidden bg-gradient-to-bl from-secondary/15 to-white border border-secondary/30 rounded-2xl p-5 flex flex-col gap-2">
							<div className="flex items-center gap-2 text-sm font-semibold peyda pb-2 border-b border-secondary/20">
								<IconUser className="stroke-secondary w-4 h-4" />
								این سفارش برای مشتری شما ثبت شده
							</div>
							<div className="font-medium text-primary text-sm">{customer.fullName}</div>
							<div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500 mt-1">
								<span dir="ltr">کد ملی: {customer.nationalId}</span>
								<span dir="ltr">تماس: {customer.phoneNumber}</span>
								<span>
									{customer.provinceName} - {customer.cityName}
								</span>
							</div>
						</div>
					)}

					{address && (
						<div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-2">
							<div className="flex items-center gap-2 text-sm font-semibold peyda pb-2 border-b border-neutral-100">
								<IconTruck className="stroke-primary w-4 h-4" />
								آدرس تحویل
							</div>
							<div className="font-medium text-primary text-sm">{address.title}</div>
							<div className="text-xs text-neutral-500">
								{address.provinceName} - {address.cityName}
							</div>
							<div className="text-xs text-neutral-600 leading-6">{address.fullAddress}</div>
							<div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400 mt-1">
								{address.plaque && <span>پلاک: {address.plaque}</span>}
								{address.unit && <span>واحد: {address.unit}</span>}
								{address.landlineNumber && <span dir="ltr">تلفن: {address.landlineNumber}</span>}
							</div>
						</div>
					)}

					<div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3">
						<div className="text-sm font-semibold peyda pb-2 border-b border-neutral-100">جزئیات پرداخت</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-neutral-500">جمع کل</span>
							<span className="font-medium">{toCurrency(order.totalAmount)} تومان</span>
						</div>
						{couponInfo && (
							<div className="flex flex-col gap-2 bg-success/5 border border-success/30 rounded-xl p-3">
								<div className="flex items-center justify-between text-sm text-success">
									<span className="flex items-center gap-1.5">
										<IconCheck className="stroke-success w-4 h-4" />
										کد تخفیف
										<span dir="ltr" className="font-mono text-xs text-neutral-500">
											{couponInfo.code}
										</span>
									</span>
									<span className="font-semibold">- {toCurrency(order.discountAmount)} تومان</span>
								</div>
								{canRemoveCoupon && (
									<button
										type="button"
										onClick={() => setRemoveCouponModalOpen(true)}
										className="self-start text-xs text-error hover:underline flex items-center gap-1"
									>
										<IconClose className="stroke-error w-3.5 h-3.5" />
										حذف کد تخفیف از سفارش
									</button>
								)}
							</div>
						)}
						<div className="flex items-center justify-between border-t border-neutral-100 pt-3">
							<span className="font-bold">مبلغ قابل پرداخت</span>
							<span className="peyda font-bold text-lg text-primary">
								{toCurrency(order.finalAmount)}
								<span className="text-xs font-normal text-neutral-500 mr-1">تومان</span>
							</span>
						</div>

						{isPaid && (
							<TabanButton
								variant="bordered"
								className="!w-full justify-center mt-1"
								onClick={downloadInvoiceHandler}
								isLoading={invoiceLoading}
								loadingText="در حال آماده‌سازی فاکتور..."
							>
								<IconDocument className="fill-primary stroke-0 w-4 h-4 ml-2" />
								دانلود فاکتور
							</TabanButton>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function StatusFlow({ order }: { order: Order }) {
	const activeIndex = orderFlowSteps.findIndex((s) => s.key === order.status);

	return (
		<div className="bg-white border border-neutral-200 rounded-2xl p-5">
			<div className="flex items-center gap-2 text-sm font-semibold peyda pb-3 border-b border-neutral-100 mb-3">
				<IconOrder className="stroke-primary w-4 h-4" />
				مراحل سفارش
			</div>
			<div className="flex flex-col">
				{orderFlowSteps.map((step, i) => {
					const done = activeIndex >= 0 && i < activeIndex;
					const current = i === activeIndex;
					const isLast = i === orderFlowSteps.length - 1;
					return (
						<div key={step.key} className="flex gap-3">
							<div className="flex flex-col items-center">
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 duration-200 ${
										done
											? "bg-primary text-white"
											: current
												? "bg-primary text-white ring-4 ring-primary/15"
												: "bg-neutral-100 text-neutral-400"
									}`}
								>
									{done ? <IconCheck className="stroke-white w-4 h-4" /> : i + 1}
								</div>
								{!isLast && (
									<div
										className={`w-0.5 flex-1 min-h-[26px] ${i < activeIndex ? "bg-primary" : "bg-neutral-200"}`}
									/>
								)}
							</div>
							<div className={isLast ? "pt-1" : "pt-1 pb-5"}>
								<div
									className={`text-sm ${done || current ? "font-semibold text-primary" : "text-neutral-400"}`}
								>
									{step.label}
								</div>
								{current && <div className="text-[11px] text-primary/70 mt-0.5">مرحله‌ی فعلی شما</div>}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function StatusGuidance({ order, onPay, paying }: { order: Order; onPay: () => void; paying: boolean }) {
	const guide = orderStatusGuide[order.status];
	const tone = guideToneClasses[guide.tone];
	const Icon = statusGuideIcon[order.status];
	const showPay = order.status === "approved";
	const showRemarks = order.status === "needs_editing" && !!order.rejectedRemarks?.trim();

	return (
		<div className={`relative overflow-hidden bg-gradient-to-l ${tone.container} border rounded-2xl p-5`}>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="relative flex items-start gap-3">
					<div className={`w-11 h-11 rounded-xl ${tone.iconWrap} flex items-center justify-center shrink-0`}>
						<Icon className={`${tone.iconColor} w-6 h-6`} />
					</div>
					<div>
						<div className={`peyda font-bold ${tone.title}`}>{guide.title}</div>
						<div className={`text-sm mt-1 leading-7 ${tone.text}`}>{guide.description}</div>
					</div>
				</div>

				{showPay && (
					<div className="relative flex items-center gap-3 shrink-0">
						<div className="text-left">
							<div className="text-xs text-neutral-500">مبلغ قابل پرداخت</div>
							<div className={`peyda font-bold text-lg ${tone.title}`}>{toCurrency(order.finalAmount)} تومان</div>
						</div>
						<TabanButton onClick={onPay} isLoading={paying} loadingText="در حال پرداخت...">
							پرداخت سفارش
						</TabanButton>
					</div>
				)}
			</div>

			{showRemarks && (
				<div className="relative mt-4 rounded-xl bg-white/70 border border-rose-200 p-3">
					<div className="text-xs font-semibold text-rose-600 mb-1">توضیحات کارشناس</div>
					<div className="text-sm text-rose-700 leading-7">{order.rejectedRemarks}</div>
				</div>
			)}
		</div>
	);
}

function OrderedDocCard({ doc, editable, onEdit }: { doc: OrderedDoc; editable: boolean; onEdit: () => void }) {
	const bd = doc.breakdown;
	const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
	const isImage = (url: string) => /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);

	return (
		<>
			<div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
							<IconDocument className="fill-primary stroke-0 w-5 h-5" />
						</div>
						<div>
							<div className="peyda font-bold text-primary">{bd.translationItemTitle}</div>
							<div className="text-xs text-neutral-500 mt-0.5">{bd.languageName}</div>
						</div>
					</div>
					{editable && (
						<TabanButton variant="icon" className="!h-8 !min-w-8 !bg-primary/5 hover:!bg-primary/15" onClick={onEdit}>
							<IconEdit className="stroke-primary w-4 h-4" />
						</TabanButton>
					)}
				</div>

				{doc.payload?.desiredDeliveryDate && (
					<div className="flex items-center gap-2 text-sm bg-secondary/5 border border-secondary/30 text-secondary rounded-xl px-3 py-2.5">
						<IconCalendar className="stroke-secondary w-4 h-4 shrink-0" />
						<span>تاریخ تحویل دلخواه شما:</span>
						<span className="font-semibold">{convertToPersianNumber(doc.payload.desiredDeliveryDate)}</span>
					</div>
				)}

				<div className="flex flex-col gap-3 border-t border-dashed border-neutral-200 pt-3">
					{bd.documents.map((d) => {
						const docPayload = doc.payload?.documents?.find((pd) => pd.documentKey === d.documentKey);
						const scanAssets = docPayload?.scanAssets ?? [];
						return (
							<div
								key={d.documentKey}
								className="border border-neutral-200 rounded-xl p-3 flex flex-col gap-2 bg-neutral-50/30"
							>
								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-1.5 font-semibold text-secondary">
										<div className="w-1.5 h-1.5 rounded-sm bg-secondary rotate-45 shrink-0" />
										{d.title}
										{(d.copyCount ?? 1) > 1 && (
											<span className="text-[10px] text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded mr-1">
												× {convertToPersianNumber(String(d.copyCount))} نسخه
											</span>
										)}
									</div>
									<div className="font-bold text-primary">
										{toCurrency(d.documentTotal)}
										<span className="text-[11px] font-normal text-neutral-500 mr-1">تومان</span>
									</div>
								</div>
								<div className="flex flex-col gap-1 text-xs text-neutral-500 pr-3">
									<div className="flex items-center justify-between">
										<span>هزینه ترجمه</span>
										<span>
											{toCurrency(d.translationTotal ?? d.base.total + d.specialsTotal)} تومان
										</span>
									</div>
									{d.mfaCertification && (
										<div className="flex items-center justify-between">
											<span>مهر وزارت امور خارجه</span>
											<span>{toCurrency(d.mfaCertification.price)} تومان</span>
										</div>
									)}
									{d.justiceCertification && (
										<div className="flex items-center justify-between">
											<span>مهر دادگستری</span>
											<span>{toCurrency(d.justiceCertification.price)} تومان</span>
										</div>
									)}
									{d.embassyApprovals?.map((e) => (
										<div key={e.embassyRateId} className="flex items-center justify-between">
											<span>{e.embassyName}</span>
											<span>{toCurrency(e.price)} تومان</span>
										</div>
									))}
									{d.justiceInquiries.map((i) => (
										<div key={i.justiceInquiryRateId} className="flex items-center justify-between">
											<span>{i.justiceInquiryName}</span>
											<span>{toCurrency(i.price)} تومان</span>
										</div>
									))}
									{d.scan && (
										<div className="flex items-center justify-between text-secondary">
											<span>اسکن مدرک</span>
											<span>{toCurrency(d.scan.price)} تومان</span>
										</div>
									)}
								</div>
								{scanAssets.length > 0 && (
									<div className="pt-2 border-t border-success/20 bg-success/5 rounded-xl p-2.5">
										<div className="text-xs font-semibold text-success mb-2 flex items-center gap-1.5">
											<IconCopy className="stroke-success w-3.5 h-3.5" />
											نتیجه اسکن ({scanAssets.length} فایل)
										</div>
										<div className="flex flex-wrap gap-2">
											{scanAssets.map((url, idx) =>
												isImage(url) ? (
													<button
														key={idx}
														type="button"
														onClick={() => setLightboxSrc(url)}
														className="w-16 h-16 rounded-lg overflow-hidden border border-success/40 hover:border-success transition-colors cursor-zoom-in"
													>
														<img
															src={url}
															alt={`اسکن ${idx + 1}`}
															className="w-full h-full object-cover"
														/>
													</button>
												) : (
													<a
														key={idx}
														href={url}
														target="_blank"
														rel="noopener noreferrer"
														className="w-16 h-16 rounded-lg border border-success/40 bg-white hover:border-success flex flex-col items-center justify-center gap-1 transition-colors"
													>
														<IconDocument className="fill-success/70 stroke-0 w-6 h-6" />
														<span className="text-[10px] text-success/70">
															PDF
														</span>
													</a>
												),
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>

				<div className="flex items-center justify-between border-t border-neutral-100 pt-3">
					<div className="text-xs text-neutral-400">{bd.documents.length} سند</div>
					<div className="flex items-center gap-1.5 font-bold text-primary">
						{toCurrency(doc.itemTotal)}
						<span className="text-xs font-normal text-neutral-500">تومان</span>
					</div>
				</div>
			</div>

			{lightboxSrc && (
				<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxSrc(null)}>
					<div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
						<img src={lightboxSrc} alt="اسکن" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
						<button
							onClick={() => setLightboxSrc(null)}
							className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white text-neutral-800 text-lg flex items-center justify-center shadow-md hover:bg-neutral-100 transition-colors"
						>
							✕
						</button>
					</div>
				</div>
			)}
		</>
	);
}
