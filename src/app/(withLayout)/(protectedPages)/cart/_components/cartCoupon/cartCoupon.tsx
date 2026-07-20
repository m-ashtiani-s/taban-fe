"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/stores/notification.store";
import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { withMappedError } from "@/utils/withMappedError";
import { toCurrency } from "@/utils/string";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { IconCheck, IconCoupon, IconCross } from "@/app/_components/icon/icons";
import { CartCouponProps } from "./cartCoupon.type";

export default function CartCoupon({ cart }: CartCouponProps) {
	const [expanded, setExpanded] = useState<boolean>(false);
	const [code, setCode] = useState<string>("");

	const showNotification = useNotificationStore((s) => s.showNotification);

	const queryClient = useQueryClient();

	const { mutate: applyCoupon, isPending: applyCouponPending } = useMutation({
		mutationFn: (couponCode: string) => withMappedError(() => CartEndpoints.applyCoupon(couponCode)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			queryClient.setQueryData(["cart", "detail"], data);
			setCode("");
			setExpanded(false);
			showNotification({ type: "success", message: data?.message ?? "کد تخفیف با موفقیت اعمال شد" });
		},
	});

	const { mutate: removeCoupon, isPending: removeCouponPending } = useMutation({
		mutationFn: () => withMappedError(() => CartEndpoints.removeCoupon()),
		meta: { showNotification: true },
		onSuccess: (data) => {
			queryClient.setQueryData(["cart", "detail"], data);
			showNotification({ type: "success", message: data?.message ?? "کد تخفیف حذف شد" });
		},
	});

	const applied = cart?.appliedCoupon ?? null;

	const submitHandler = () => {
		const trimmed = code.trim();
		if (!trimmed) {
			showNotification({ type: "error", message: "کد تخفیف را وارد کنید" });
			return;
		}
		applyCoupon(trimmed);
	};

	if (applied) {
		return (
			<div className="bg-success/5 border border-success/30 rounded-2xl p-4 flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2 flex-wrap">
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center shrink-0">
							<IconCheck className="stroke-success w-5 h-5" />
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-success peyda">کد تخفیف اعمال شد</span>
							<span dir="ltr" className="text-xs text-neutral-500 font-mono">
								{applied.code}
							</span>
						</div>
					</div>
					<TabanButton
						variant="text"
						className="!text-error !px-2"
						onClick={() => removeCoupon()}
						isLoading={removeCouponPending}
						disabled={removeCouponPending}
					>
						حذف کد
					</TabanButton>
				</div>
				<div className="border-t border-success/20 pt-3 flex flex-col gap-2 text-sm">
					<div className="flex items-center justify-between text-xs text-neutral-500">
						<span>نحوه اعمال</span>
						<span className="font-medium text-neutral-700">
							{applied.appliesTo === "base" ? "روی نرخ پایه و ویژگی‌ها" : "روی مبلغ کل مدرک"}
						</span>
					</div>
					<div className="flex items-center justify-between text-xs text-neutral-500">
						<span>مبلغ قابل تخفیف</span>
						<span className="font-medium text-neutral-700">
							{toCurrency(applied.applicableSubtotal)}
							<span className="text-[11px] font-normal text-neutral-400 mr-1">تومان</span>
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-neutral-600">مبلغ تخفیف</span>
						<span className="font-bold text-success">
							- {toCurrency(applied.discountAmount)}
							<span className="text-xs font-normal text-neutral-500 mr-1">تومان</span>
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col gap-3">
			{!expanded ? (
				<button
					type="button"
					onClick={() => setExpanded(true)}
					className="flex items-center justify-between gap-2 group"
				>
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
							<IconCoupon className="fill-secondary stroke-0 w-5 h-5" />
						</div>
						<div className="flex flex-col text-right">
							<span className="text-sm font-semibold peyda text-primary">کد تخفیف دارید؟</span>
							<span className="text-xs text-neutral-400">برای وارد کردن کلیک کنید</span>
						</div>
					</div>
					<span className="text-xs text-secondary font-medium group-hover:underline">افزودن کد</span>
				</button>
			) : (
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
							<IconCoupon className="fill-secondary stroke-0 w-5 h-5" />
						</div>
						<span className="text-sm font-semibold peyda text-primary">کد تخفیف خود را وارد کنید</span>
					</div>
					<div className="flex items-stretch gap-2">
						<div className="flex-1">
							<TabanInput
								label="کد تخفیف"
								isLtr
								value={code}
								setValue={setCode}
								disabled={applyCouponPending}
								onKeyDown={(e) => {
									if (e?.key === "Enter") submitHandler();
								}}
							/>
						</div>
						<TabanButton
							onClick={submitHandler}
							isLoading={applyCouponPending}
							disabled={applyCouponPending || !code.trim()}
							className="!px-5"
						>
							اعمال
						</TabanButton>
						<TabanButton
							variant="icon"
							className="!w-10"
							onClick={() => {
								setExpanded(false);
								setCode("");
							}}
							disabled={applyCouponPending}
						>
							<IconCross className="fill-neutral-500 stroke-0 w-5 h-5" />
						</TabanButton>
					</div>
				</div>
			)}
		</div>
	);
}
