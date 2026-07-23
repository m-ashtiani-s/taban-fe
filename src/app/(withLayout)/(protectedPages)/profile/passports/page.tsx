"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { ResultError } from "@/types/result";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { PassportEndpoints } from "@/app/_api/passportEndpoints";
import { Passport } from "@/types/passport.type";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import PassportModal from "@/app/_components/common/passportModal/passportModal";
import { IconDocument } from "@/app/_components/icon/icons";
import PassportCard from "./_components/passportCard/passportCard";

const PAGE_SIZE = 100;

export default function Page() {
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [createOpen, setCreateOpen] = useState<boolean>(false);
	const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
	const [statusTarget, setStatusTarget] = useState<Passport | null>(null);

	const listQuery = useQuery({
		queryKey: ["passports", "list", { page: 1, pageSize: PAGE_SIZE }],
		queryFn: () => withMappedError(() => PassportEndpoints.getPassports(null, 1, PAGE_SIZE)),
		retry: false,
		meta: { showNotification: true },
	});
	const { mutateAsync: executeToggleStatus, isPending: toggleLoading } = useMutation({
		mutationFn: (passport: Passport) =>
			withMappedError(() =>
				passport.isActive
					? PassportEndpoints.deactivatePassport(passport.passportId)
					: PassportEndpoints.activatePassport(passport.passportId),
			),
	});

	const listLoading = listQuery.isFetching;
	const listResult =
		listQuery.error ?? (listQuery.data !== undefined ? { success: true as const, data: listQuery.data } : null);

	const refetch = () => listQuery.refetch();
	const passports: Passport[] = listResult?.success ? listResult.data?.data?.elements ?? [] : [];

	const askToggleStatus = (passport: Passport) => {
		setStatusTarget(passport);
		setStatusModalOpen(true);
	};

	const confirmToggleStatus = async () => {
		if (!statusTarget) return;
		try {
			await executeToggleStatus(statusTarget);
			showNotification({ type: "success", message: statusTarget.isActive ? "پاسپورت غیرفعال شد" : "پاسپورت فعال شد" });
			setStatusModalOpen(false);
			setStatusTarget(null);
			refetch();
		} catch (err) {
			showNotification({ type: "error", message: (err as ResultError)?.description ?? "تغییر وضعیت پاسپورت با خطا مواجه شد" });
		}
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2 text-lg font-bold peyda text-primary">
					<IconDocument width={24} height={24} className="fill-primary stroke-0" />
					پاسپورت‌های من
				</div>
				<TabanButton onClick={() => setCreateOpen(true)}>افزودن پاسپورت جدید</TabanButton>
			</div>

			{listLoading && !listResult ? (
				<div className="flex items-center justify-center py-16 gap-2 text-sm text-neutral-500">
					<TabanLoading size={28} />
					در حال دریافت پاسپورت‌ها...
				</div>
			) : listResult?.success ? (
				passports.length > 0 ? (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{passports.map((passport) => (
							<PassportCard key={passport.passportId} passport={passport} onToggleStatus={askToggleStatus} />
						))}
					</div>
				) : (
					<div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-center">
						<div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
							<IconDocument width={28} height={28} className="fill-primary/60 stroke-0" />
						</div>
						<div className="text-sm text-neutral-500">هنوز پاسپورتی ثبت نکرده‌اید</div>
						<TabanButton onClick={() => setCreateOpen(true)}>افزودن اولین پاسپورت</TabanButton>
					</div>
				)
			) : !!listResult && !listResult.success && isRetryAble(listResult.code) ? (
				<div className="flex justify-center mt-4">
					<ErrorComponent executeFunction={refetch} callAble errorText="دریافت لیست پاسپورت‌ها با خطا مواجه شد." />
				</div>
			) : (
				<div className="flex items-center justify-center py-10 text-sm text-neutral-500">داده‌ای موجود نیست</div>
			)}

			<PassportModal open={createOpen} setOpen={setCreateOpen} onCreated={() => refetch()} />

			<TabanModal
				open={statusModalOpen}
				setOpen={setStatusModalOpen}
				onClose={() => setStatusTarget(null)}
				title={statusTarget?.isActive ? "غیرفعال کردن پاسپورت" : "فعال کردن پاسپورت"}
			>
				<div>
					{statusTarget?.isActive
						? `آیا از غیرفعال کردن پاسپورت «${statusTarget?.title}» اطمینان دارید؟`
						: `آیا از فعال کردن پاسپورت «${statusTarget?.title}» اطمینان دارید؟`}
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
