"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useCartStore } from "@/stores/cart";
import { useNotificationStore } from "@/stores/notification.store";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { TabanEndpoints } from "@/app/_api/endpoints";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import { ShippingAddressEndpoints } from "@/app/(withLayout)/(protectedPages)/profile/addresses/_api/endpoint";
import { ShippingAddress } from "@/app/(withLayout)/(protectedPages)/profile/addresses/_types/shippingAddress.type";
import { OrderEndpoints } from "@/app/(withLayout)/(protectedPages)/profile/orders/_api/endpoint";
import { FormErrors } from "@/types/formErrors.type";
import { findError } from "@/utils/formErrorsFinder";
import { toCurrency } from "@/utils/string";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanTextarea from "@/app/_components/common/tabanTextarea/tabanTextarea";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconCart, IconCheck, IconDocument, IconRequired, IconTruck } from "@/app/_components/icon/icons";

const PAGE_SIZE = 10;

export default function CheckoutPage() {
	const router = useRouter();
	const { cart, setCart } = useCartStore();
	const showNotification = useNotificationStore((s) => s.showNotification);

	const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
	const [addrPage, setAddrPage] = useState<number>(1);
	const [addrTotalPages, setAddrTotalPages] = useState<number>(1);
	const [selectedAddressId, setSelectedAddressId] = useState<string>("");
	const [remarks, setRemarks] = useState<string>("");
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
	const [completeModalOpen, setCompleteModalOpen] = useState<boolean>(false);

	const getCart = useApi(async () => await CartEndpoints.getCart(), true);
	const getCompletion = useApi(async () => await TabanEndpoints.getProfileCompletionStatus());
	const getAddresses = useApi(async (page: number) => await ShippingAddressEndpoints.getShippingAddresses({ isActive: true }, page, PAGE_SIZE));
	const createOrder = useApi(
		async () => await OrderEndpoints.createOrder({ shippingAddressId: selectedAddressId, remarks: remarks.trim() || undefined }),
	);

	useEffect(() => {
		getCart.fetchData();
		getCompletion.fetchData();
		loadAddresses(1);
	}, []);

	useEffect(() => {
		if (getCart.result?.success) setCart(getCart.result.data?.data ?? null);
	}, [getCart.result]);

	useEffect(() => {
		if (formSubmitted) formValidator();
	}, [selectedAddressId]);

	const loadAddresses = async (page: number) => {
		const res = await getAddresses.fetchDataResult(page);
		if (res.success) {
			const data = res.data?.data;
			const elements = (data?.elements ?? []) as ShippingAddress[];
			setAddresses((prev) => (page === 1 ? elements : [...prev, ...elements]));
			setAddrPage(data?.page ?? page);
			setAddrTotalPages(data?.totalPages ?? 1);
		} else {
			showNotification({ type: "error", message: res.description ?? "دریافت آدرس‌ها با خطا مواجه شد" });
		}
	};

	const formValidator = (): FormErrors[] => {
		const errors: FormErrors[] = [];
		if (!selectedAddressId) errors.push({ item: "address", message: "انتخاب آدرس تحویل الزامی است" });
		setFormErrors(errors);
		return errors;
	};

	const submitHandler = async () => {
		setFormSubmitted(true);
		const errors = formValidator();
		if (errors.length > 0) {
			showNotification({ type: "error", message: "لطفا آدرس تحویل را انتخاب کنید" });
			return;
		}
		if (getCompletion.resultData?.data && !getCompletion.resultData.data.isCompleted) {
			setCompleteModalOpen(true);
			return;
		}
		const res = await createOrder.fetchDataResult();
		if (res.success) {
			showNotification({ type: "success", message: res.data?.message ?? "سفارش با موفقیت ثبت شد" });
			setTimeout(() => {
				setCart(null);
			}, 1000);
			const orderId = res.data?.data?.orderId;
			router.push(orderId ? `/profile/orders/${orderId}` : "/profile/orders");
		} else {
			showNotification({ type: "error", message: res.description ?? "ثبت سفارش با خطا مواجه شد" });
		}
	};

	const items = cart?.items ?? [];
	const cartLoading = getCart.loading && !getCart.result;

	if (cartLoading) {
		return (
			<div className="flex items-center justify-center gap-2 py-20 text-sm text-neutral-500">
				<TabanLoading size={24} />
				در حال بارگذاری اطلاعات...
			</div>
		);
	}

	if (items.length === 0 && !createOrder.loading) {
		return (
			<div className="flex flex-col items-center justify-center gap-6 py-20 bg-white border border-neutral-200 rounded-2xl mt-16 max-lg:px-4">
				<div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
					<IconCart stroke="#aaa" className="w-9 h-9" />
				</div>
				<div className="text-center">
					<div className="peyda font-bold text-lg text-neutral-500 mb-1">سبد خرید خالی است</div>
					<div className="text-sm text-neutral-400">برای ثبت سفارش ابتدا ترجمه‌ای به سبد خرید اضافه کنید</div>
				</div>
				<TabanButton isLink href="/new-order">
					ثبت سفارش ترجمه
				</TabanButton>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 pt-16 max-lg:pt-8 max-lg:px-4">
			<TabanModal open={completeModalOpen} setOpen={setCompleteModalOpen} title="تکمیل پروفایل" onClose={() => setCompleteModalOpen(false)}>
				<div className="flex flex-col items-center gap-4 py-2 text-center">
					<div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center">
						<IconRequired viewBox="0 0 100 100" width={30} height={30} className="fill-secondary stroke-0" />
					</div>
					<div className="peyda font-bold text-primary">برای ثبت سفارش، پروفایلت رو کامل کن</div>
					<div className="text-sm text-neutral-500 leading-7">
						برای ثبت نهایی سفارش لازمه اطلاعات حساب کاربری شما تکمیل باشه. بعد از تکمیل، دوباره به این صفحه برگرد.
					</div>
					<div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
						<TabanButton variant="bordered" onClick={() => setCompleteModalOpen(false)} className="flex-1 justify-center">
							بعدا
						</TabanButton>
						<TabanButton isLink href="/profile/complete?backUrl=/cart/checkout" className="flex-1 justify-center">
							تکمیل پروفایل
						</TabanButton>
					</div>
				</div>
			</TabanModal>

			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<IconTruck className="stroke-primary w-5 h-5" />
				</div>
				<div>
					<h1 className="peyda font-bold text-xl text-primary">تسویه و ثبت سفارش</h1>
					<div className="text-xs text-neutral-500">آدرس تحویل را انتخاب و سفارش خود را نهایی کنید</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
				{/* address selection */}
				<div className="lg:col-span-2 flex flex-col gap-5">
					<div className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6">
						<div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
							<div className="flex items-center gap-2 font-semibold peyda">
								<IconTruck className="stroke-primary w-5 h-5" />
								انتخاب آدرس تحویل
							</div>
							<TabanButton
								variant="bordered"
								isLink
								href="/profile/addresses/create?backUrl=/cart/checkout"
								className="!py-1.5 !text-sm"
							>
								+ آدرس جدید
							</TabanButton>
						</div>

						{getAddresses.loading && addresses.length === 0 ? (
							<div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
								<TabanLoading size={22} />
								در حال دریافت آدرس‌ها...
							</div>
						) : addresses.length === 0 ? (
							<div className="flex flex-col items-center gap-4 py-10 text-center">
								<div className="text-sm text-neutral-500">هنوز آدرسی ثبت نکرده‌اید</div>
								<TabanButton isLink href="/profile/addresses/create?backUrl=/cart/checkout">
									افزودن آدرس
								</TabanButton>
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{addresses.map((addr) => {
										const active = selectedAddressId === addr.shippingAddressId;
										return (
											<button
												type="button"
												key={addr.shippingAddressId}
												onClick={() => setSelectedAddressId(addr.shippingAddressId)}
												className={`text-right relative rounded-xl border p-4 duration-200 flex flex-col gap-2 ${
													active
														? "border-primary bg-primary/5 ring-1 ring-primary"
														: "border-neutral-200 hover:border-primary/40"
												}`}
											>
												<div className="flex items-center justify-between">
													<div className="font-semibold peyda text-primary">
														{addr.title}
													</div>
													<div
														className={`w-5 h-5 rounded-full border flex items-center justify-center ${
															active
																? "border-primary bg-primary"
																: "border-neutral-300"
														}`}
													>
														{active && (
															<IconCheck className="stroke-white w-3 h-3" />
														)}
													</div>
												</div>
												<div className="text-xs text-neutral-500">
													{addr.provinceName} - {addr.cityName}
												</div>
												<div className="text-xs text-neutral-600 leading-6 line-clamp-2">
													{addr.fullAddress}
												</div>
											</button>
										);
									})}
								</div>

								{addrPage < addrTotalPages && (
									<div className="flex justify-center mt-4">
										<TabanButton
											variant="bordered"
											onClick={() => loadAddresses(addrPage + 1)}
											isLoading={getAddresses.loading}
											loadingText="در حال دریافت..."
										>
											نمایش آدرس‌های بیشتر
										</TabanButton>
									</div>
								)}
							</>
						)}

						{!!findError(formErrors, "address") && (
							<div className="text-error text-xs flex items-center gap-1 mt-3">
								<IconRequired viewBox="0 0 100 100" width={14} height={14} className="fill-error stroke-0" />
								{findError(formErrors, "address")?.message}
							</div>
						)}
					</div>

					<div className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6">
						<div className="font-semibold peyda pb-3 border-b border-neutral-100 mb-4">توضیحات سفارش (اختیاری)</div>
						<TabanTextarea
							label="در صورت نیاز توضیحی برای سفارش خود بنویسید..."
							name="remarks"
							minHeight={90}
							value={remarks}
							onChange={(e) => setRemarks(e.target.value)}
						/>
					</div>
				</div>

				{/* order summary */}
				<div className="lg:col-span-1 lg:sticky lg:top-[88px]">
					<div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
						<div className="font-semibold peyda pb-3 border-b border-neutral-100">خلاصه سفارش</div>

						<div className="flex flex-col gap-3 max-h-64 overflow-y-auto taban-scroll">
							{items.map((item) => (
								<div key={item.cartItemId} className="flex items-center justify-between gap-2 text-sm">
									<div className="flex items-center gap-2 min-w-0">
										<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
											<IconDocument className="fill-primary stroke-0 w-4 h-4" />
										</div>
										<div className="truncate">
											<div className="font-medium text-neutral-800 truncate">
												{item.breakdown.translationItemTitle}
											</div>
											<div className="text-[11px] text-neutral-400">
												{item.breakdown.languageName}
											</div>
										</div>
									</div>
									<div className="text-xs font-medium shrink-0">
										{toCurrency(item.breakdown.summary.totalPrice)}
									</div>
								</div>
							))}
						</div>

						<div className="border-t border-dashed border-neutral-200 pt-3 flex flex-col gap-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-neutral-500">جمع کل</span>
								<span className="font-medium">{toCurrency(cart?.cartSum ?? 0)} تومان</span>
							</div>
							{(cart?.cartSum ?? 0) - (cart?.cartSumWithDiscount ?? 0) > 0 && (
								<div className="flex items-center justify-between text-success">
									<span>تخفیف</span>
									<span>
										- {toCurrency((cart?.cartSum ?? 0) - (cart?.cartSumWithDiscount ?? 0))} تومان
									</span>
								</div>
							)}
						</div>

						<div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
							<span className="font-bold">مبلغ قابل پرداخت</span>
							<span className="peyda font-bold text-lg text-primary">
								{toCurrency(cart?.cartSumWithDiscount ?? cart?.cartSum ?? 0)}
								<span className="text-xs font-normal text-neutral-500 mr-1">تومان</span>
							</span>
						</div>
						<div className="flex gap-3 flex-col w-full">
							<div className="bg-success/10 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
								<div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
									<IconCheck className="stroke-success w-4 h-4" />
								</div>
								<div className="text-xs text-success leading-6">
									این مبلغ پس از تأیید مدارک شما توسط ادمین، توسط شما پرداخت خواهد شد.
								</div>
							</div>
							<TabanButton
								className="!w-full justify-center"
								onClick={submitHandler}
								isLoading={createOrder.loading}
								loadingText="در حال ثبت سفارش..."
							>
								ثبت نهایی سفارش
							</TabanButton>
							<TabanButton variant="text" isLink href="/cart" className="!w-full justify-center">
								بازگشت به سبد خرید
							</TabanButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
