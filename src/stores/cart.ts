import { Cart } from "@/types/cart.type";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CartState = {
	cart: Cart | null;
	setCart: (it: Cart | null) => void;
	cartLoading: boolean;
	setCartLoading: (it: boolean) => void;
};

export const useCartStore = create<CartState>()(
	devtools((set, get) => ({
		cart: null,
		setCart: (it) => {
			set((state) => ({
				cart: it,
			}));
		},
		cartLoading: true,
		setCartLoading: (it) => {
			set((state) => ({
				cartLoading: it,
			}));
		},
	}))
);
