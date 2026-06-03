"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanAutocompleteWrapper from "@/app/_components/common/tabanAutocompleteWrapper/tabanAutocompleteWrapper";
import TabanTable from "@/app/_components/common/TabanTable/tabanTable";
import { TabanColumn } from "@/app/_components/common/TabanTable/tabanTable.type";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconCross, IconEye, IconUser } from "@/app/_components/icon/icons";
import { CustomerEndpoints } from "../../_api/endpoint";
import { Customer, CustomerFilters } from "../../_types/customer.type";

type BooleanOption = { label: string; value: boolean | null };
const booleanOptions: BooleanOption[] = [
	{ label: "همه", value: null },
	{ label: "فعال", value: true },
	{ label: "غیرفعال", value: false },
];

const PAGE_SIZE = 10;

export default function CustomersPage() {
	const router = useRouter();
	const showNotification = useNotificationStore((s) => s.showNotification);
	const mount = useRef<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [filters, setFilters] = useState<CustomerFilters>({});
	const [term, setTerm] = useState<string>("");
	const [selectedIsActive, setSelectedIsActive] = useState<BooleanOption | null>(null);
	const [statusTarget, setStatusTarget] = useState<Customer | null>(null);
	const [columns, setColumns] = useState<TabanColumn<Customer>[]>([]);

	const getCustomers = useApi(
		async (f: CustomerFilters, p: number) => await CustomerEndpoints.getCustomers(f, p, PAGE_SIZE),
		true,
	);
	const toggle = useApi(async (id: string, isActive: boolean) =>
		isActive ? await CustomerEndpoints.deactivateCustomer(id) : await CustomerEndpoints.activateCustomer(id),
	);

	useEffect(() => {
		getCustomers.fetchData(filters, page);
	}, [page]);

	useEffect(() => {
		if (page > 1) setPage(1);
		else if (mount.current) getCustomers.fetchData(filters, 1);
		else mount.current = true;
	}, [filters]);

	const searchHandler = () => {
		setFilters({ term: term?.trim() || undefined, isActive: selectedIsActive?.value ?? undefined });
	};
	const resetHandler = () => {
		setTerm("");
		setSelectedIsActive(null);
		setFilters({});
	};

	const toggleHandler = async () => {
		if (!statusTarget) return;
		const res = await toggle.fetchDataResult(statusTarget.customerId, statusTarget.isActive);
		if (res.success) {
			showNotification({ type: "success", message: statusTarget.isActive ? "مشتری غیرفعال شد" : "مشتری فعال شد" });
			setStatusTarget(null);
			getCustomers.fetchData(filters, page);
		} else {
			showNotification({ type: "error", message: res.description ?? "تغییر وضعیت با خطا مواجه شد" });
		}
	};

	useEffect(() => {
		setColumns([
			{ field: "fullName", headerName: "نام و نام خانوادگی", renderCell: (r) => <span className="font-medium">{r.fullName}</span> },
			{ field: "nationalId", headerName: "کد ملی", renderCell: (r) => <span dir="ltr">{r.nationalId}</span> },
			{ field: "phoneNumber", headerName: "شماره تماس", renderCell: (r) => <span dir="ltr">{r.phoneNumber}</span> },
			{ field: "province", headerName: "استان / شهر", renderCell: (r) => `${r.provinceName} - ${r.cityName}` },
			{
				field: "isActive",
				headerName: "وضعیت",
				renderCell: (r) => (
					<div className="flex gap-2 items-center">
						<div
							onClick={() => setStatusTarget(r)}
							className={`rounded-lg h-8 w-8 flex items-center justify-center cursor-pointer ${r.isActive ? "bg-success/15" : "bg-error/15"}`}
						>
							{r.isActive ? (
								<span className="w-2.5 h-2.5 rounded-full bg-success" />
							) : (
								<IconCross className="fill-error stroke-error w-4 h-4" strokeWidth={0.5} />
							)}
						</div>
						<span>{r.isActive ? "فعال" : "غیرفعال"}</span>
					</div>
				),
			},
			{
				field: "eye",
				headerName: "",
				width: 48,
				renderCell: (r) => (
					<TabanButton variant="icon" onClick={() => router.push(`/enterprise-customers/profile/customers/${r.customerId}`)}>
						<IconEye />
					</TabanButton>
				),
			},
		]);
	}, [getCustomers.result]);

	const data = getCustomers.resultData?.data;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
						<IconUser className="stroke-primary w-5 h-5" />
					</div>
					<div>
						<h1 className="peyda font-bold text-xl text-primary">کاربران زیرمجموعه</h1>
						<div className="text-xs text-neutral-500">{data?.totalElements ? `${data.totalElements} مشتری` : "مدیریت مشتریان شما"}</div>
					</div>
				</div>
				<TabanButton onClick={() => router.push("/enterprise-customers/profile/customers/create")}>افزودن مشتری</TabanButton>
			</div>

			{/* filters */}
			<div className="bg-white border border-neutral-200 rounded-2xl p-4 flex gap-2 items-center flex-wrap">
				<div className="w-[220px]">
					<TabanInput
						label="جستجو (نام، کد ملی، تماس)"
						value={term}
						setValue={setTerm}
						disabled={getCustomers.loading}
						onKeyDown={(e) => {
							if (e?.key === "Enter") searchHandler();
						}}
					/>
				</div>
				<div className="w-[150px]">
					<TabanAutocompleteWrapper
						label="وضعیت"
						options={booleanOptions}
						selectedOption={selectedIsActive}
						setSelectedOption={setSelectedIsActive}
						valueField="value"
						displayField="label"
						loading={false}
						disabled={getCustomers.loading}
						wrapperErrorText=""
						resultStatus={true}
					/>
				</div>
				<TabanButton onClick={searchHandler} disabled={getCustomers.loading} isLoading={getCustomers.loading} loadingText="در حال جستجو">
					جستجو
				</TabanButton>
				<TabanButton variant="bordered" onClick={resetHandler} disabled={getCustomers.loading}>
					پاک کردن
				</TabanButton>
			</div>

			{getCustomers.loading && !getCustomers.result ? (
				<div className="flex justify-center gap-2 items-center py-12 text-sm text-neutral-500">
					<TabanLoading size={30} />
					در حال دریافت...
				</div>
			) : getCustomers.result?.success ? (
				<div className="bg-white border border-neutral-200 p-4 rounded-2xl">
					<TabanTable
						uniqueId="customerId"
						showRow
						rows={data?.elements || []}
						className="w-full"
						columns={columns}
						page={page}
						setPage={setPage}
						totalElements={data?.totalElements ?? 0}
						rowPerPage={data?.pageSize ?? PAGE_SIZE}
						paginationMode="server"
						sortingMode="server"
						loading={getCustomers.loading}
					/>
				</div>
			) : !!getCustomers.result && !getCustomers.result.success && isRetryAble(getCustomers.result.code) ? (
				<div className="flex justify-center mt-4">
					<ErrorComponent executeFunction={() => getCustomers.fetchData(filters, page)} callAble errorText="دریافت لیست مشتریان با خطا مواجه شد" />
				</div>
			) : (
				<div className="text-sm text-neutral-500 text-center py-10">داده‌ای موجود نیست</div>
			)}

			<TabanModal
				open={!!statusTarget}
				setOpen={(v) => !v && setStatusTarget(null)}
				title={statusTarget?.isActive ? "غیرفعال کردن مشتری" : "فعال کردن مشتری"}
				onClose={() => setStatusTarget(null)}
			>
				<div className="flex flex-col gap-4">
					<div className="text-sm text-neutral-600 leading-7">
						آیا از {statusTarget?.isActive ? "غیرفعال" : "فعال"} کردن مشتری «{statusTarget?.fullName}» اطمینان دارید؟
					</div>
					<div className="flex justify-end gap-3">
						<TabanButton variant="bordered" onClick={() => setStatusTarget(null)} disabled={toggle.loading}>
							انصراف
						</TabanButton>
						<TabanButton onClick={toggleHandler} isLoading={toggle.loading}>
							بله، مطمئنم
						</TabanButton>
					</div>
				</div>
			</TabanModal>
		</div>
	);
}
