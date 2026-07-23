"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { IconArrow, IconCart, IconUser } from "@/app/_components/icon/icons";
import { CustomerEndpoints } from "../../../_api/endpoint";
import { Customer } from "../../../_types/customer.type";

export default function CreateOrderForCustomerPage() {
	const router = useRouter();

	const customersQuery = useQuery({
		queryKey: ["enterpriseCustomers", "list", { isActive: true, page: 1, pageSize: 100 }],
		queryFn: () => withMappedError(() => CustomerEndpoints.getCustomers({ isActive: true }, 1, 100)),
		retry: false,
	});
	const customersLoading = customersQuery.isFetching;
	const customersResult =
		customersQuery.error ?? (customersQuery.data !== undefined ? { success: true as const, data: customersQuery.data } : null);
	const customers = ((customersQuery.error ? null : customersQuery.data)?.data?.elements ?? []) as Customer[];

	const startOrderFor = (customer: Customer) => {
		// همان فلوی ثبت سفارش سایت اجرا می‌شود؛ آی‌دی مشتری از طریق query به فلوی سفارش منتقل می‌شود
		router.push(`/new-order?customerId=${customer.customerId}`);
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => router.push("/enterprise-customers/profile/orders")}
					className="w-10 h-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 duration-150"
				>
					<IconArrow className="rotate-90 stroke-neutral-600 fill-neutral-600" width={20} height={20} />
				</button>
				<div className="flex items-center gap-2 text-lg font-bold peyda text-primary">
					<IconCart className="stroke-primary w-5 h-5" />
					ثبت سفارش برای مشتری
				</div>
			</div>

			<div className="text-sm text-neutral-500">
				مشتری‌ای که می‌خواهید سفارش ترجمه برای او ثبت شود را انتخاب کنید. پس از انتخاب، وارد فرآیند ثبت سفارش می‌شوید.
			</div>

			{customersLoading && !customersResult ? (
				<div className="flex justify-center gap-2 items-center py-12 text-sm text-neutral-500">
					<TabanLoading size={28} />
					در حال دریافت مشتریان...
				</div>
			) : !!customersResult && !customersResult.success && isRetryAble(customersResult.code) ? (
				<div className="flex justify-center mt-4">
					<ErrorComponent executeFunction={() => customersQuery.refetch()} callAble errorText="دریافت مشتریان با خطا مواجه شد" />
				</div>
			) : customers.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-dashed border-neutral-200 rounded-2xl">
					<IconUser className="stroke-neutral-400 w-12 h-12" />
					<div className="text-sm text-neutral-500">مشتری فعالی برای ثبت سفارش ندارید</div>
					<TabanButton isLink href="/enterprise-customers/profile/customers/create">
						افزودن مشتری
					</TabanButton>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{customers.map((c, i) => (
						<motion.button
							key={c.customerId}
							type="button"
							onClick={() => startOrderFor(c)}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.03 }}
							className="group text-right bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary hover:shadow-md duration-200 flex items-center justify-between gap-3"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 peyda font-bold text-primary">
									{(c.firstName ?? "?").charAt(0)}
								</div>
								<div className="min-w-0">
									<div className="peyda font-bold text-primary truncate">{c.fullName}</div>
									<div className="text-xs text-neutral-500 mt-0.5">
										{c.provinceName} - {c.cityName}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-1.5 text-primary text-sm shrink-0 group-hover:gap-2.5 duration-200">
								<IconCart className="stroke-primary w-4 h-4" />
								ثبت سفارش
							</div>
						</motion.button>
					))}
				</div>
			)}
		</div>
	);
}
