import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EnterpriseCustomer } from "@/app/(withLayout)/(protectedPages)/enterprise-customers/_types/enterpriseCustomer.type";

type EnterpriseState = {
	enterpriseCustomer: EnterpriseCustomer | null;
	setEnterpriseCustomer: (it: EnterpriseCustomer | null) => void;
};

export const useEnterpriseStore = create<EnterpriseState>()(
	devtools((set) => ({
		enterpriseCustomer: null,
		setEnterpriseCustomer: (it) => set(() => ({ enterpriseCustomer: it })),
	}))
);
