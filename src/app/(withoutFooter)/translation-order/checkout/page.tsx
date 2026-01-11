"use client";

import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { IconArrowLine, IconCross, IconRequired, IconUpload } from "@/app/_components/icon/icons";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { OrderState, useOrderStore } from "../_store/rate.store";
import { toCurrency } from "@/utils/string";
import { useMemo, useState } from "react";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";

export default function Page() {
	const { order, setOrder }: OrderState = useOrderStore();
	const [hasDiscount, setHasDiscount] = useState<boolean>(false);
	const [discount, setDiscount] = useState<string>("");

	const translationPrice = useMemo(() => {
		const baseRate = +(order?.baseRate ?? 0);
		let dynamicRate = 0;
		order?.specialItems?.map((item) => {
			item?.specials?.map((it) => {
				dynamicRate = dynamicRate + +it?.price;
			});
		});
		return baseRate + dynamicRate;
	}, [order]);

	const certificationPrice = useMemo(() => {
		let jCertifications = 0;
		let mCertifications = 0;
		order?.justiceCertification?.map((item) => {
			jCertifications = jCertifications + +(item?.justiceCertification?.price ?? 0);
		});
		order?.mfaCertification?.map((item) => {
			mCertifications = mCertifications + +(item?.mfaCertification?.price ?? 0);
		});
		
		return jCertifications + mCertifications;
	}, [order]);

	const inquiryPrice = useMemo(() => {
		let inquiryRate = 0;
		order?.justiceInquiriesItems?.map((it) => {
			it?.justiceInquiries?.map((it) => {
				inquiryRate = inquiryRate + +it?.price;
			});
		});
		return inquiryRate;
	}, [order]);

	const totalPrice = useMemo(() => {
		return translationPrice + certificationPrice + inquiryPrice;
	}, [translationPrice, certificationPrice, inquiryPrice]);

	const taxPrice = useMemo(() => {
		return totalPrice * 0.1;
	}, [totalPrice]);

	return (
		<div className="h-full">
			<div className="container h-full">
				<div className="flex border w-full border-neutral-300 rounded-lg p-4 h-[calc(100%-16px)] flex-col relative">
					<div className="flex flex-col h-[calc(100%-40px)] taban-scroll">
						<div className=" flex items-center gap-2 w-full px-8 pb-16 border-b border-dashed border-neutral-300">
							<CreateRateLevels activeLevel={7} />
						</div>

						<div className="flex gap-4 py-8">
							
							<div className="h-full w-[1px] bg-neutral-200"></div>
							<div className="flex flex-col w-full px-4 !pr-2">
								<div className="flex items-center justify-between">
									<div className="text-sm">مدرک ترجمه:</div>
									<div className="font-medium">{order?.translationItem?.title}</div>
								</div>
								<div className="h-[1px] w-full bg-neutral-200 my-2"></div>
								<div className="flex items-center justify-between">
									<div className="text-sm">زبان ترجمه:</div>
									<div className="font-medium">{order?.language?.languageName}</div>
								</div>
								<div className="h-[1px] w-full bg-neutral-200 my-2"></div>
								<div className="flex items-center justify-between">
									<div className="text-sm">مبلغ ترجمه :</div>
									<div className="flex items-center gap-1 font-semibold">
										{toCurrency(translationPrice)}
										<span className="text-xs font-normal">تومان</span>
									</div>
								</div>
								<div className="h-[1px] w-full bg-neutral-200 my-2"></div>
								<div className="flex items-center justify-between">
									<div className="text-sm">مبلغ تاییدات ترجمه :</div>
									<div className="flex items-center gap-1 font-semibold">
										{toCurrency(certificationPrice)}
										<span className="text-xs font-normal">تومان</span>
									</div>
								</div>
								<div className="h-[1px] w-full bg-neutral-200 my-2"></div>
								<div className="flex items-center justify-between">
									<div className="text-sm">مبلغ استعلام های ترجمه :</div>
									<div className="flex items-center gap-1 font-semibold">
										{toCurrency(inquiryPrice)}
										<span className="text-xs font-normal">تومان</span>
									</div>
								</div>
								<div className="h-[1px] w-full bg-neutral-200 my-2"></div>
								<div className="flex items-center justify-between">
									<div className="font-bold">مبلغ کل ترجمه :</div>
									<div className="flex items-center gap-1 font-semibold">
										{toCurrency(totalPrice)}
										<span className="text-xs font-normal">تومان</span>
									</div>
								</div>
								<div className="h-[1px] w-full bg-neutral-200 my-2"></div>
								<div className="flex items-center gap-1 py-1 cursor-pointer">
									<div className="text-link font-medium" onClick={() => setHasDiscount(true)}>
										کد تخفیف دارید؟
										<span className="font-light text-sm">(برای وارد کردن کد کلیک کنید)</span>
									</div>
								</div>
								{hasDiscount && (
									<div className="flex items-center gap-1">
										<div className="flex w-56 py-1">
											<TabanInput
												label="کد تخفیف"
												isLtr
												value={discount}
												setValue={setDiscount}
											/>
										</div>
										<TabanButton variant="text" className="!px-2">
											اعمال
										</TabanButton>
										<TabanButton
											onClick={() => setHasDiscount(false)}
											className="!w-7 !h-7"
											variant="icon"
										>
											<IconCross className="fill-primary stroke-0 w-5 h-5" />
										</TabanButton>
									</div>
								)}
								<div className="flex items-center justify-end gap-2 pt-2">
									<TabanButton isLink href="/translation-order/upload" variant="text">
										بازگشت
									</TabanButton>
									<TabanButton isLink href="/translation-order/checkout">
										افزودن سفارش به سبد خرید
									</TabanButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
