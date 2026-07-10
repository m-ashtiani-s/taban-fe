"use client";

import { createContext, useContext } from "react";
import { EditFlowContextValue } from "./editFlow.type";

const EditFlowContext = createContext<EditFlowContextValue | null>(null);

export const EditFlowProvider = EditFlowContext.Provider;

export function useEditFlow(): EditFlowContextValue {
	const ctx = useContext(EditFlowContext);
	if (!ctx) {
		throw new Error("useEditFlow must be used within the order-edit layout provider");
	}
	return ctx;
}
