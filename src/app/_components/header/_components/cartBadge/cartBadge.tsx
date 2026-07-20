import { CartEndpoints } from "@/app/_api/cartEndpoints";
import { IconCart } from "@/app/_components/icon/icons";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { withMappedError } from "@/utils/withMappedError";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function CartBadge() {
	const cartQuery = useQuery({
		queryKey: ["cart", "detail"],
		queryFn: () => withMappedError(() => CartEndpoints.getCart()),
		staleTime: 3_000,
	});

	const cart = cartQuery.data?.data ?? null;
	const count = cart?.items?.length ?? 0;
	return (
		<div className="relative group py-2">
			{/* Cart icon */}
			<Link href="/cart" className="relative">
				<div className="w-10 h-10 flex items-center justify-center cursor-pointer">
					<IconCart strokeWidth={1.5} className="stroke-white w-6 h-6 duration-200 group-hover:!stroke-secondary" />
					{count > 0 && (
						<span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
							{count}
						</span>
					)}
				</div>
			</Link>

			{/* Hover popup */}
			<div className="hidden group-hover:!block absolute top-full left-0 pt-1 z-50">
				<div className="w-80 bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden">
					{/* Header */}
					<div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
						<span className="text-sm font-semibold text-primary peyda">سبد خرید</span>
						{count > 0 && (
							<span className="text-xs text-neutral-500">
								{convertToPersianNumber(String(count))} آیتم
							</span>
						)}
					</div>

					{/* Items list */}
					{count === 0 ? (
						<div className="px-4 py-6 flex flex-col items-center gap-2 text-neutral-400">
							<IconCart strokeWidth={1.5} className="w-8 h-8 stroke-neutral-300" />
							<span className="text-xs">سبد خرید خالی است</span>
						</div>
					) : (
						<div className="max-h-56 overflow-y-auto divide-y divide-neutral-100">
							{cart?.items?.map((item) => (
								<div key={item.cartItemId} className="px-4 py-3 flex items-start gap-3">
									<div className="flex-1 min-w-0">
										<div className="text-xs font-medium text-primary truncate">
											{item.breakdown.translationItemTitle}
										</div>
										<div className="text-[11px] text-neutral-500 mt-0.5">
											{item.breakdown.languageName}
											{" · "}
											{convertToPersianNumber(String(item.payload.documents.length))} سند
										</div>
									</div>
									<div className="text-xs font-bold text-secondary whitespace-nowrap shrink-0">
										{convertToPersianNumber(item.breakdown.summary.totalPrice.toLocaleString())}
										<span className="font-normal text-neutral-400 mr-0.5">ت</span>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Footer */}
					{count > 0 && (
						<div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/60">
							<span className="text-xs text-neutral-600">جمع کل</span>
							<span className="text-sm font-bold text-primary peyda">
								{convertToPersianNumber(
									(cart?.cartSumWithDiscount ?? cart?.cartSum ?? 0).toLocaleString()
								)}{" "}
								<span className="text-xs font-normal text-neutral-500">تومان</span>
							</span>
						</div>
					)}

					<Link
						href="/cart"
						className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs font-medium py-3 duration-200"
					>
						<IconCart strokeWidth={1.5} className="w-4 h-4 stroke-white" />
						مشاهده سبد خرید
					</Link>
				</div>
			</div>
		</div>
	);
}