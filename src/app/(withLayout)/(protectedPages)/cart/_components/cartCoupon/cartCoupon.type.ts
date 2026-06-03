import { Cart } from "@/types/cart.type";

export type CartCouponProps = {
	cart: Cart | null;
	onCartChange: (cart: Cart | null) => void;
};
