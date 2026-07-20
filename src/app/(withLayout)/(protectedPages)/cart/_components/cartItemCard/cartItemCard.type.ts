import { AppliedCoupon, AppliedCouponItemDiscount, CartItem } from "@/types/cart.type";

export type CartItemCardProps = {
	item: CartItem;
	itemDiscount: AppliedCouponItemDiscount | null;
	appliedCoupon: AppliedCoupon | null;
	onDelete: () => void;
};
