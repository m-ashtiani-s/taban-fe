"use client";

import { createContext, useContext } from "react";
import { Language } from "@/types/language.type";
import { TranslationItem } from "@/types/translationItem.type";
import { OrderRates } from "../_hooks/useOrderRates";

/**
 * مقادیر مشترکی که لایوتِ فلوی سفارش (new-order/layout) می‌سازد و صفحه‌ی هر مرحله
 * ([step]/page) مصرف می‌کند. چون لایوت بین ناوبریِ مراحل remount نمی‌شود، این مقادیر
 * (به‌ویژه نرخ‌ها) بین تمام مراحل پایدار می‌مانند.
 */
export type OrderFlowContextValue = {
	rates: OrderRates;
	onSelectItem: (item: TranslationItem) => void;
	onSelectLanguage: (language: Language) => void;
	resetSteps: () => void;
};

const OrderFlowContext = createContext<OrderFlowContextValue | null>(null);

export const OrderFlowProvider = OrderFlowContext.Provider;

export function useOrderFlow(): OrderFlowContextValue {
	const ctx = useContext(OrderFlowContext);
	if (!ctx) {
		throw new Error("useOrderFlow must be used within the new-order layout provider");
	}
	return ctx;
}
