"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconTruck } from "@/app/_components/icon/icons";
import { ShippingAddressEndpoints } from "./_api/endpoint";
import { ShippingAddress, ShippingAddressFilters } from "./_types/shippingAddress.type";
import AddressFilters from "./_components/addressFilters/addressFilters";
import AddressCard from "./_components/addressCard/addressCard";

const PAGE_SIZE = 100;

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const mount = useRef<boolean>(false);
	const [filters, setFilters] = useState<ShippingAddressFilters>({});

	const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
	const [statusTarget, setStatusTarget] = useState<ShippingAddress | null>(null);

	const {
		result: addressesResult,
		resultData: addressesData,
		fetchData: executeAddresses,
		loading: addressesLoading,
	} = useApi(
		async (currentFilters: ShippingAddressFilters | null) =>
			await ShippingAddressEndpoints.getShippingAddresses(currentFilters, 1, PAGE_SIZE),
		true,
	);

	const { fetchDataResult: executeToggleStatus, loading: toggleLoading } = useApi(
		async (address: ShippingAddress) =>
			address.isActive
				? await ShippingAddressEndpoints.deactivateShippingAddress(address.shippingAddressId)
				: await ShippingAddressEndpoints.activateShippingAddress(address.shippingAddressId),
	);

	useEffect(() => {
		executeAddresses(filters);
	}, []);

	useEffect(() => {
		if (mount.current) {
			executeAddresses(filters);
		} else {
			mount.current = true;
		}
	}, [filters]);

	useEffect(() => {
		if (addressesResult && !addressesResult.success) {
			showNotification({
				type: "error",
				message: addressesResult.description ?? "دریافت لیست آدرس‌ها با خطا مواجه شد",
			});
		}
	}, [addressesResult]);

	const refetch = () => executeAddresses(filters);

	const openCreate = () => router.push("/profile/addresses/create");

	const openEdit = (address: ShippingAddress) => router.push(`/profile/addresses/${address.shippingAddressId}/edit`);

	const askToggleStatus = (address: ShippingAddress) => {
		setStatusTarget(address);
		setStatusModalOpen(true);
	};

	const confirmToggleStatus = async () => {
		if (!statusTarget) return;
		const result = await executeToggleStatus(statusTarget);
		if (result.success) {
			showNotification({
				type: "success",
				message: statusTarget.isActive ? "آدرس غیرفعال شد" : "آدرس فعال شد",
			});
			setStatusModalOpen(false);
			setStatusTarget(null);
			refetch();
		} else {
			showNotification({ type: "error", message: result.description ?? "تغییر وضعیت آدرس با خطا مواجه شد" });
		}
	};

	const addresses: ShippingAddress[] = addressesData?.data?.elements ?? [];

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2 text-lg font-bold peyda text-primary">
					<IconTruck width={24} height={24} className="stroke-primary" />
					آدرس‌های من
				</div>
				<TabanButton onClick={openCreate}>افزودن آدرس جدید</TabanButton>
			</div>

			<AddressFilters setFilters={setFilters} dataLoading={addressesLoading} />

			{addressesLoading && !addressesResult ? (
				<div className="flex items-center justify-center py-16 gap-2 text-sm text-neutral-500">
					<TabanLoading size={28} />
					در حال دریافت آدرس‌ها...
				</div>
			) : addressesResult?.success ? (
				addresses.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{addresses.map((address) => (
							<AddressCard
								key={address.shippingAddressId}
								address={address}
								onEdit={openEdit}
								onToggleStatus={askToggleStatus}
							/>
						))}
					</div>
				) : (
					<div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-center">
						<div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
							<IconTruck width={28} height={28} className="stroke-primary/60" />
						</div>
						<div className="text-sm text-neutral-500">هنوز آدرسی ثبت نکرده‌اید</div>
						<TabanButton onClick={openCreate}>افزودن اولین آدرس</TabanButton>
					</div>
				)
			) : !!addressesResult && !addressesResult.success && isRetryAble(addressesResult.code) ? (
				<div className="flex justify-center mt-4">
					<ErrorComponent
						executeFunction={() => executeAddresses(filters)}
						callAble
						errorText="دریافت لیست آدرس‌ها با خطا مواجه شد."
					/>
				</div>
			) : (
				<div className="flex items-center justify-center py-10 text-sm text-neutral-500">داده‌ای موجود نیست</div>
			)}

			<TabanModal
				open={statusModalOpen}
				setOpen={setStatusModalOpen}
				onClose={() => setStatusTarget(null)}
				title={statusTarget?.isActive ? "غیرفعال کردن آدرس" : "فعال کردن آدرس"}
			>
				<div>
					{statusTarget?.isActive
						? `آیا از غیرفعال کردن آدرس «${statusTarget?.title}» اطمینان دارید؟`
						: `آیا از فعال کردن آدرس «${statusTarget?.title}» اطمینان دارید؟`}
					<div className="mt-10 flex justify-end gap-4">
						<TabanButton variant="bordered" onClick={() => setStatusModalOpen(false)} disabled={toggleLoading}>
							انصراف
						</TabanButton>
						<TabanButton onClick={confirmToggleStatus} isLoading={toggleLoading} loadingText="در حال انجام...">
							تایید
						</TabanButton>
					</div>
				</div>
			</TabanModal>
		</div>
	);
}
