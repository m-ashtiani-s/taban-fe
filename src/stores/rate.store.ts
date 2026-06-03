import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CreateOrder } from "@/types/createOrder.type";

export type OrderState = {
	order: CreateOrder | null;
	setOrder: (it: CreateOrder | ((prev: CreateOrder | null) => CreateOrder | null) | null) => void;
};

export const useOrderStore = create<OrderState>()(
	devtools((set) => ({
		order: null,
		setOrder: (it) => {
			set((state) => ({
				order: typeof it === "function" ? (it as (prev: CreateOrder | null) => CreateOrder | null)(state.order) : it,
			}));
		},
	}))
);
