"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { ShippingAddressEndpoints } from "../../_api/endpoint";
import AddressForm from "../../_components/addressForm/addressForm";

export default function Page({ params }: { params: { shippingAddressId: string } }) {
	const router = useRouter();

	const {
		result: addressResult,
		resultData: addressData,
		fetchData: executeAddress,
		loading: addressLoading,
	} = useApi(async (id: string) => await ShippingAddressEndpoints.getShippingAddress(id), true);

	useEffect(() => {
		executeAddress(params?.shippingAddressId);
	}, []);

	const address = addressData?.data ?? null;

	if (addressLoading && !addressResult) {
		return (
			<div className="flex items-center justify-center py-16 gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال دریافت اطلاعات آدرس...
			</div>
		);
	}

	if (addressResult?.success && address) {
		return <AddressForm mode="edit" address={address} />;
	}

	if (!!addressResult && !addressResult.success && isRetryAble(addressResult.code)) {
		return (
			<div className="flex justify-center mt-4">
				<ErrorComponent
					executeFunction={() => executeAddress(params?.shippingAddressId)}
					callAble
					errorText="دریافت اطلاعات آدرس با خطا مواجه شد."
				/>
			</div>
		);
	}

	return (
		<div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-center">
			<div className="text-sm text-neutral-500">آدرس مورد نظر یافت نشد</div>
			<TabanButton variant="bordered" onClick={() => router.push("/profile/addresses")}>
				بازگشت به لیست آدرس‌ها
			</TabanButton>
		</div>
	);
}
