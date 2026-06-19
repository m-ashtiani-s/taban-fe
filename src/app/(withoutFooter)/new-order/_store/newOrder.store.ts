import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CreateOrder } from "@/types/createOrder.type";
import { generateUUID } from "@/utils/string";

export const createEmptyOrder = (): CreateOrder => ({
	translationItemCount: 1,
	translationItem: null,
	language: null,
	baseRateCount: {},
	translationItemNames: {},
	specialItems: [],
	justiceInquiriesItems: [],
	embassyItems: [],
	copyCount: {},
	mfaCertification: [],
	justiceCertification: [],
	passports: [],
	assets: [],
	assetsByDoc: {},
	uploadScope: generateUUID(),
	isOfficial: true,
});

export type NewOrderState = {
	order: CreateOrder;
	setOrder: (it: CreateOrder | ((prev: CreateOrder) => CreateOrder)) => void;
	resetOrder: () => void;
};

export const useNewOrderStore = create<NewOrderState>()(
	devtools((set) => ({
		order: createEmptyOrder(),
		setOrder: (it) =>
			set((state) => ({
				order: typeof it === "function" ? (it as (prev: CreateOrder) => CreateOrder)(state.order) : it,
			})),
		resetOrder: () => set({ order: createEmptyOrder() }),
	}))
);
