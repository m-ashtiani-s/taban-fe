"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useEnterpriseStore } from "@/stores/enterprise";
import { useProfiletore } from "@/stores/profile";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { Profile } from "@/types/profile.type";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { EnterpriseCustomerEndpoints } from "../_api/endpoint";
import EnterpriseSidebar from "./_components/enterpriseSidebar/enterpriseSidebar";

export default function EnterpriseProfileLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { setEnterpriseCustomer } = useEnterpriseStore();
	const { setProfile } = useProfiletore();

	const getMine = useApi(async () => await EnterpriseCustomerEndpoints.getMyEnterpriseCustomer(), true);
	const getProfile = useApi(async () => await TabanEndpoints.getProfile());

	useEffect(() => {
		getMine.fetchData();
		getProfile.fetchData();
	}, []);

	useEffect(() => {
		if (getMine.result) {
			if (getMine.result.success) {
				setEnterpriseCustomer(getMine.resultData?.data ?? null);
			} else {
				// کاربری که مشتری سازمانی نیست به صفحه ثبت‌نام سازمانی هدایت می‌شود
				router.replace("/enterprise-customers");
			}
		}
	}, [getMine.result]);

	useEffect(() => {
		if (getProfile.result?.success) setProfile((getProfile.resultData?.data as Profile) ?? null);
	}, [getProfile.result]);

	if (getMine.loading && !getMine.result) {
		return (
			<div className="container mx-auto px-4 py-20 flex items-center justify-center gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال بارگذاری پنل سازمانی...
			</div>
		);
	}

	if (getMine.result && !getMine.result.success) {
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
