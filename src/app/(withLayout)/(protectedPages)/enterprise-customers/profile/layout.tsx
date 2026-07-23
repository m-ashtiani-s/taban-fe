"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { useEnterpriseStore } from "@/stores/enterprise";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { EnterpriseCustomerEndpoints } from "../_api/endpoint";
import EnterpriseSidebar from "./_components/enterpriseSidebar/enterpriseSidebar";

export default function EnterpriseProfileLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { setEnterpriseCustomer } = useEnterpriseStore();

	const getMineQuery = useQuery({
		queryKey: ["enterpriseCustomer", "mine"],
		queryFn: () => withMappedError(() => EnterpriseCustomerEndpoints.getMyEnterpriseCustomer()),
		retry: false,
	});
	const getMineResult =
		getMineQuery.error ?? (getMineQuery.data !== undefined ? { success: true as const, data: getMineQuery.data } : null);
	const getMineLoading = getMineQuery.isFetching;

	useEffect(() => {
		if (getMineResult) {
			if (getMineResult.success) {
				setEnterpriseCustomer(getMineResult.data?.data ?? null);
			} else {
				// کاربری که مشتری سازمانی نیست به صفحه ثبت‌نام سازمانی هدایت می‌شود
				router.replace("/enterprise-customers");
			}
		}
	}, [getMineQuery.data, getMineQuery.error]);

	if (getMineLoading && !getMineResult) {
		return (
			<div className="container mx-auto px-4 py-20 flex items-center justify-center gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال بارگذاری پنل سازمانی...
			</div>
		);
	}

	if (getMineResult && !getMineResult.success) {
		return null;
	}

	return (
		<div className="container mx-auto px-4 py-6 lg:py-10">
			<div className="flex flex-col lg:flex-row gap-6">
				<EnterpriseSidebar />
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</div>
	);
}
