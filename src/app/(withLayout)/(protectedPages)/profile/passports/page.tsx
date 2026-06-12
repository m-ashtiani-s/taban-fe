"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
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

	const list = useApi(async () => await PassportEndpoints.getPassports(null, 1, PAGE_SIZE), true);
	const { fetchDataResult: executeToggleStatus, loading: toggleLoading } = useApi(async (passport: Passport) =>
		passport.isActive
			? await PassportEndpoints.deactivatePassport(passport.passportId)
			: await PassportEndpoints.activatePassport(passport.passportId)
	);

	useEffect(() => {
		list.fetchData();
	}, []);

	useEffect(() => {
		if (list.result && !list.result.success) {
			showNotification({ type: "error", message: list.result.description ?? "دریافت لیست پاسپورت‌ها با خطا مواجه شد" });
		}
	}, [list.result]);

	const refetch = () => list.fetchData();
	const passports: Passport[] = list.result?.success ? list.result.data?.data?.elements ?? [] : [];

	const askToggleStatus = (passport: Passport) => {
		setStatusTarget(passport);
		setStatusModalOpen(true);
	};

	const confirmToggleStatus = async () => {
		if (!statusTarget) return;
		const result = await executeToggleStatus(statusTarget);
		if (result.success) {
			showNotification({ type: "success", message: statusTarget.isActive ? "پاسپورت غیرفعال شد" : "پاسپورت فعال شد" });
			setStatusModalOpen(false);
			setStatusTarget(null);
			refetch();
		} else {
			showNotification({ type: "error", message: result.description ?? "تغییر وضعیت پاسپورت با خطا مواجه شد" });
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

			{list.loading && !list.result ? (
				<div className="flex items-center justify-center py-16 gap-2 text-sm text-neutral-500">
					<TabanLoading size={28} />
					در حال دریافت پاسپورت‌ها...
				</div>
			) : list.result?.success ? (
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
			) : !!list.result && !list.result.success && isRetryAble(list.result.code) ? (
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
