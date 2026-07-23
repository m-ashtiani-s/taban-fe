"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { ShippingAddressEndpoints } from "../../_api/endpoint";
import AddressForm from "../../_components/addressForm/addressForm";

export default function Page({ params }: { params: { shippingAddressId: string } }) {
	const router = useRouter();

	const addressQuery = useQuery({
		queryKey: ["shippingAddresses", "detail", params?.shippingAddressId],
		queryFn: () => withMappedError(() => ShippingAddressEndpoints.getShippingAddress(params.shippingAddressId)),
		retry: false,
	});
	const addressLoading = addressQuery.isFetching;
	const addressResult =
		addressQuery.error ?? (addressQuery.data !== undefined ? { success: true as const, data: addressQuery.data } : null);

	const address = (addressQuery.error ? null : (addressQuery.data ?? null))?.data ?? null;

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
					executeFunction={() => addressQuery.refetch()}
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
