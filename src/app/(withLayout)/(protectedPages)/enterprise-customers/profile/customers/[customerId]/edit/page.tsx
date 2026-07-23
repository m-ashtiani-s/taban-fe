"use client";

import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { CustomerEndpoints } from "../../../../_api/endpoint";
import CustomerForm from "../../_components/customerForm/customerForm";

export default function Page({ params }: { params: { customerId: string } }) {
	const customerQuery = useQuery({
		queryKey: ["enterpriseCustomers", "detail", params.customerId],
		queryFn: () => withMappedError(() => CustomerEndpoints.getCustomer(params.customerId)),
		retry: false,
	});
	const customerLoading = customerQuery.isFetching;
	const customerResult =
		customerQuery.error ?? (customerQuery.data !== undefined ? { success: true as const, data: customerQuery.data } : null);
	const customer = (customerQuery.error ? null : (customerQuery.data ?? null))?.data ?? null;

	if (customerLoading && !customerResult) {
		return (
			<div className="flex items-center justify-center py-16 gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال دریافت اطلاعات مشتری...
			</div>
		);
	}

	if (customerResult?.success && customer) return <CustomerForm mode="edit" customer={customer} />;

	if (!!customerResult && !customerResult.success && isRetryAble(customerResult.code)) {
		return (
			<div className="flex justify-center mt-4">
				<ErrorComponent executeFunction={() => customerQuery.refetch()} callAble errorText="دریافت اطلاعات مشتری با خطا مواجه شد" />
			</div>
		);
	}

	return (
		<div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
			<div className="text-sm text-neutral-500">مشتری مورد نظر یافت نشد</div>
			<TabanButton variant="bordered" isLink href="/enterprise-customers/profile/customers">
				بازگشت به لیست مشتریان
			</TabanButton>
		</div>
	);
}
