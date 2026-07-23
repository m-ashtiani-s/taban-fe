"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { ResultError } from "@/types/result";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconArrow, IconEdit, IconUser } from "@/app/_components/icon/icons";
import { CustomerEndpoints } from "../../../_api/endpoint";

export default function Page({ params }: { params: { customerId: string } }) {
	const router = useRouter();
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);

	const customerQuery = useQuery({
		queryKey: ["enterpriseCustomers", "detail", params.customerId],
		queryFn: () => withMappedError(() => CustomerEndpoints.getCustomer(params.customerId)),
		retry: false,
	});
	const { mutateAsync: toggle, isPending: togglePending } = useMutation({
		mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
			withMappedError(() => (isActive ? CustomerEndpoints.deactivateCustomer(id) : CustomerEndpoints.activateCustomer(id))),
	});

	const customerLoading = customerQuery.isFetching;
	const customerResult =
		customerQuery.error ?? (customerQuery.data !== undefined ? { success: true as const, data: customerQuery.data } : null);
	const customer = (customerQuery.error ? null : (customerQuery.data ?? null))?.data ?? null;

	const toggleHandler = async () => {
		if (!customer) return;
		try {
			await toggle({ id: customer.customerId, isActive: customer.isActive });
			showNotification({ type: "success", message: customer.isActive ? "مشتری غیرفعال شد" : "مشتری فعال شد" });
			setStatusModalOpen(false);
			customerQuery.refetch();
		} catch (err) {
			showNotification({ type: "error", message: (err as ResultError)?.description ?? "تغییر وضعیت با خطا مواجه شد" });
		}
	};

	if (customerLoading && !customerResult) {
		return (
			<div className="flex items-center justify-center py-16 gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال دریافت اطلاعات مشتری...
			</div>
		);
	}

	if (!!customerResult && !customerResult.success && isRetryAble(customerResult.code)) {
		return (
			<div className="flex justify-center mt-4">
				<ErrorComponent executeFunction={() => customerQuery.refetch()} callAble errorText="دریافت اطلاعات مشتری با خطا مواجه شد" />
			</div>
		);
	}

	if (!customer) {
		return (
			<div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
				<div className="text-sm text-neutral-500">مشتری مورد نظر یافت نشد</div>
				<TabanButton variant="bordered" isLink href="/enterprise-customers/profile/customers">
					بازگشت به لیست مشتریان
				</TabanButton>
			</div>
		);
	}

	const rows = [
		{ label: "نام", value: customer.firstName },
		{ label: "نام خانوادگی", value: customer.lastName },
		{ label: "کد ملی", value: customer.nationalId },
		{ label: "شماره تماس", value: customer.phoneNumber },
		{ label: "استان", value: customer.provinceName },
		{ label: "شهر", value: customer.cityName },
	];

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => router.push("/enterprise-customers/profile/customers")}
						className="w-10 h-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 duration-150"
					>
						<IconArrow className="rotate-90 stroke-neutral-600 fill-neutral-600" width={20} height={20} />
					</button>
					<div className="flex items-center gap-2 text-lg font-bold peyda text-primary">
						<IconUser className="stroke-primary w-5 h-5" />
						جزئیات مشتری
					</div>
				</div>
				<div className="flex items-center gap-2">
					<TabanButton variant="bordered" onClick={() => setStatusModalOpen(true)}>
						{customer.isActive ? "غیرفعال کردن" : "فعال کردن"}
					</TabanButton>
					<TabanButton isLink href={`/enterprise-customers/profile/customers/${customer.customerId}/edit`}>
						<IconEdit className="stroke-white w-4 h-4 ml-1" />
						ویرایش
					</TabanButton>
				</div>
			</div>

			{/* creative hero card */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-primary to-[#040e27] text-white p-6">
				<div className="absolute -top-12 -left-10 w-52 h-52 rounded-full bg-secondary/20 blur-3xl" />
				<div className="relative flex items-center gap-4">
					<div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0 peyda font-bold text-2xl">
						{(customer.firstName ?? "?").charAt(0)}
					</div>
					<div>
						<div className="text-xl font-bold peyda">{customer.fullName}</div>
						<div className="text-sm text-white/70 mt-0.5" dir="ltr">{customer.phoneNumber}</div>
						<div
							className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border mt-2 ${
								customer.isActive ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/30" : "bg-rose-400/15 text-rose-200 border-rose-300/30"
							}`}
						>
							<span className={`w-1.5 h-1.5 rounded-full ${customer.isActive ? "bg-emerald-300" : "bg-rose-300"}`} />
							{customer.isActive ? "فعال" : "غیرفعال"}
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
				<div className="px-5 lg:px-6 py-4 border-b border-neutral-100 text-sm font-semibold peyda">اطلاعات مشتری</div>
				<div className="divide-y divide-neutral-100">
					{rows.map((row, i) => (
						<div key={i} className="flex flex-col md:flex-row md:items-center px-5 lg:px-6 py-3.5 text-sm gap-1 md:gap-4">
							<span className="text-neutral-500 w-full md:w-44 shrink-0">{row.label}</span>
							<span className="font-medium text-neutral-800" dir={row.label === "کد ملی" || row.label === "شماره تماس" ? "ltr" : undefined}>
								{row.value}
							</span>
						</div>
					))}
				</div>
			</div>

			<TabanModal
				open={statusModalOpen}
				setOpen={setStatusModalOpen}
				title={customer.isActive ? "غیرفعال کردن مشتری" : "فعال کردن مشتری"}
				onClose={() => setStatusModalOpen(false)}
			>
				<div className="flex flex-col gap-4">
					<div className="text-sm text-neutral-600 leading-7">
						آیا از {customer.isActive ? "غیرفعال" : "فعال"} کردن مشتری «{customer.fullName}» اطمینان دارید؟
					</div>
					<div className="flex justify-end gap-3">
						<TabanButton variant="bordered" onClick={() => setStatusModalOpen(false)} disabled={togglePending}>
							انصراف
						</TabanButton>
						<TabanButton onClick={toggleHandler} isLoading={togglePending}>
							بله، مطمئنم
						</TabanButton>
					</div>
				</div>
			</TabanModal>
		</div>
	);
}
