import TabanLoading from "@/app/_components/common/tabanLoading.tsx/tabanLoading";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { API_URL } from "@/config/global";
import { readData, updateData } from "@/core/http-service/http-service";
import { useCartStore } from "@/stores/cart";
import { useNotificationStore } from "@/stores/notification.store";
import { Cart } from "@/types/cart.type";
import { Res } from "@/types/responseType";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { toCurrency } from "@/utils/string";
import { useState } from "react";

export default function CartMenu() {
	const { cart, setCart, cartLoading } = useCartStore();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [quantityLoading, setQuantityLoading] = useState<Record<string, boolean>>({});

	const editQuantity = async (productId: string, quantity: number) => {
		try {
			setQuantityLoading((prev) => ({ ...prev, [productId]: true }));
			const res = await updateData<{ productId: string; quantity: number }, null>(`${API_URL}v1/user/cart`, { productId, quantity });
			executeCart(productId);
		} catch (error: any) {
			showNotification({
				type: "error",
				message: error?.message ?? "تغییر در سبد خرید با خطا مواجه شد",
			});
			setQuantityLoading((prev) => ({ ...prev, [productId]: false }));
		} finally {
		}
	};

	const executeCart = async (productId: string) => {
		try {
			const res = await readData<Res<Cart>>(`${API_URL}v1/user/cart`);
			setCart(res?.data);
		} catch (error: any) {
			console.warn(error);
			setCart(null);
		} finally {
			setQuantityLoading((prev) => ({ ...prev, [productId]: false }));
		}
	};

	return (
		<div className="">
			<div className="pb-4 border-b border-b-neutral-200/80 text-sm font-medium">{cart?.products?.length} کالا در سبد خرید شما موجود است</div>
			<div className="max-h-[380px] overflow-y-auto py-2">
				{cart?.products?.map((it, index) => (
					<div key={it?.productId} className={`flex items-start gap-4 py-2 ${index !== 0 && "border-t border-t-neutral-200"}`}>
						<div className="flex flex-col gap-2">
							<div
								style={{ backgroundImage: `url('${it?.featuredImage}')` }}
								className=" h-20 !bg-cover !bg-center rounded"
							></div>
							<div className="flex items-center border border-neutral-300 rounded-lg relative">
								<button
									onClick={() => editQuantity(it?.productId, it?.quantity !== 1 ? it?.quantity - 1 : 0)}
									className="rounded-r-lg cursor-pointer hover:bg-primary/20 duration-200 w-8 flex justify-center text-lg border-l border-l-neutral-300"
								>
									-
								</button>
								<div className="w-10 justify-center flex text-sm font-semibold border-l border-l-neutral-300">
									{convertToPersianNumber(it?.quantity)}
								</div>
								<button
									disabled={it?.quantity >= +it?.stockQuantity}
									onClick={() =>
										it?.quantity < +it?.stockQuantity &&
										editQuantity(
											it?.productId,
											it?.quantity < +it?.stockQuantity ? it?.quantity + 1 : it?.quantity
										)
									}
									className="w-8 flex justify-center text-lg rounded-l-lg cursor-pointer hover:bg-primary/20 duration-200 disabled:opacity-40"
								>
									+
								</button>
								{!!quantityLoading && !!quantityLoading[it?.productId] && (
									<div className="bg-white/60 w-full h-full absolute left-0 top-0 flex items-center justify-center pt-2">
										<TabanLoading size={18} />
									</div>
								)}
							</div>
						</div>
						<div className="flex flex-col gap-0 w-full">
							<div className="= font-medium text-sm">{it?.title}</div>
							<div className="mt-2 flex gap-4 w-full">
								{it?.discount && it?.discount > 0 && it?.priceWithDiscount ? (
									<div className="font-medium line-through text-neutral-400">
										{toCurrency(it?.price?.toString())}{" "}
										<span className="font-semibold text-xs text-neutral-300">تومان</span>
									</div>
								) : (
									<div></div>
								)}
								<div className="font-semibold">
									{toCurrency(it?.priceWithDiscount?.toString())}{" "}
									<span className="font-semibold text-xs text-neutral-500">تومان</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className=" pt-4 flex justify-between border-t border-t-neutral-200">
				<div className="flex flex-col">
					<div className="text-xs">مبلغ قابل پرداخت</div>
					<div className="font-semibold text-xl">
						{toCurrency(cart!?.cartSumWithDiscount?.toString())}{" "}
						<span className="font-semibold text-xs text-neutral-500">تومان</span>
					</div>
				</div>
				<TabanButton isLink href="/checkout/order">
					ثبت سفارش
				</TabanButton>
			</div>
		</div>
	);
}
