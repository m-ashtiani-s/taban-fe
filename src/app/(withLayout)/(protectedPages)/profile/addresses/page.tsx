"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { ResultError } from "@/types/result";
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
	const [filters, setFilters] = useState<ShippingAddressFilters>({});

	const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
	const [statusTarget, setStatusTarget] = useState<ShippingAddress | null>(null);

	const addressesQuery = useQuery({
		queryKey: ["shippingAddresses", "list", { filters, page: 1, pageSize: PAGE_SIZE }],
		queryFn: () => withMappedError(() => ShippingAddressEndpoints.getShippingAddresses(filters, 1, PAGE_SIZE)),
		placeholderData: keepPreviousData,
		retry: false,
		meta: { showNotification: true },
	});

	const { mutateAsync: executeToggleStatus, isPending: toggleLoading } = useMutation({
		mutationFn: (address: ShippingAddress) =>
			withMappedError(() =>
				address.isActive
					? ShippingAddressEndpoints.deactivateShippingAddress(address.shippingAddressId)
					: ShippingAddressEndpoints.activateShippingAddress(address.shippingAddressId),
			),
	});

	const addressesLoading = addressesQuery.isFetching;
	const addressesResult =
		addressesQuery.error ?? (addressesQuery.data !== undefined ? { success: true as const, data: addressesQuery.data } : null);

	const refetch = () => addressesQuery.refetch();

	const openCreate = () => router.push("/profile/addresses/create");

	const openEdit = (address: ShippingAddress) => router.push(`/profile/addresses/${address.shippingAddressId}/edit`);

	const askToggleStatus = (address: ShippingAddress) => {
		setStatusTarget(address);
		setStatusModalOpen(true);
	};

	const confirmToggleStatus = async () => {
		if (!statusTarget) return;
		try {
			await executeToggleStatus(statusTarget);
			showNotification({
				type: "success",
				message: statusTarget.isActive ? "آدرس غیرفعال شد" : "آدرس فعال شد",
			});
			setStatusModalOpen(false);
			setStatusTarget(null);
			refetch();
		} catch (err) {
			showNotification({ type: "error", message: (err as ResultError)?.description ?? "تغییر وضعیت آدرس با خطا مواجه شد" });
		}
	};

	const addresses: ShippingAddress[] = (addressesQuery.error ? null : (addressesQuery.data ?? null))?.data?.elements ?? [];

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
						executeFunction={() => refetch()}
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
