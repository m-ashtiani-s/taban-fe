"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { ResultError } from "@/types/result";
import { useNotificationStore } from "@/stores/notification.store";
import { useEnterpriseStore } from "@/stores/enterprise";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { FormErrors } from "@/types/formErrors.type";
import { findError } from "@/utils/formErrorsFinder";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanTextarea from "@/app/_components/common/tabanTextarea/tabanTextarea";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconDashboard, IconCheck, IconInfo } from "@/app/_components/icon/icons";
import { EnterpriseCustomerEndpoints } from "./_api/endpoint";
import { EnterpriseCustomerPayload } from "./_types/enterpriseCustomer.type";

type FormValues = { institutionName?: string; institutionAddress?: string; registrationId?: string };

export default function EnterpriseRegisterPage() {
	const showNotification = useNotificationStore((s) => s.showNotification);
	const setEnterpriseCustomer = useEnterpriseStore((s) => s.setEnterpriseCustomer);

	const [formValues, setFormValues] = useState<FormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
	const [registered, setRegistered] = useState<boolean>(false);

	const getMineQuery = useQuery({
		queryKey: ["enterpriseCustomer", "mine"],
		queryFn: () => withMappedError(() => EnterpriseCustomerEndpoints.getMyEnterpriseCustomer()),
		retry: false,
	});
	const { mutateAsync: register, isPending: registerPending } = useMutation({
		mutationFn: (payload: EnterpriseCustomerPayload) => withMappedError(() => EnterpriseCustomerEndpoints.register(payload)),
	});
	const getMineResult =
		getMineQuery.error ?? (getMineQuery.data !== undefined ? { success: true as const, data: getMineQuery.data } : null);
	const getMineLoading = getMineQuery.isFetching;

	const completionQuery = useQuery({
		queryKey: ["profile", "completion"],
		queryFn: () => withMappedError(() => TabanEndpoints.getProfileCompletionStatus()),
		staleTime: 3_000,
		meta: { showNotification: true },
	});

	const alreadyEnterprise = getMineResult?.success && !!getMineResult.data?.data;
	const completion = completionQuery.data?.data;
	const profileCompleted = completion?.isCompleted ?? false;
	const loading = (getMineLoading && !getMineResult) || completionQuery.isPending;

	useEffect(() => {
		if (formSubmitted) formValidator();
	}, [formValues]);

	const formValidator = (): FormErrors[] => {
		const errors: FormErrors[] = [];
		if (!formValues.institutionName?.trim()) errors.push({ item: "institutionName", message: "نام موسسه الزامی است" });
		if (!formValues.institutionAddress?.trim()) errors.push({ item: "institutionAddress", message: "آدرس موسسه الزامی است" });
		setFormErrors(errors);
		return errors;
	};

	const submitHandler = async () => {
		setFormSubmitted(true);
		const errors = formValidator();
		if (errors.length > 0) {
			showNotification({ type: "error", message: "لطفا موارد لازم را تکمیل کنید" });
			return;
		}
		try {
			const data = await register({
				institutionName: formValues.institutionName!.trim(),
				institutionAddress: formValues.institutionAddress!.trim(),
				registrationId: formValues.registrationId?.trim() || null,
			});
			setEnterpriseCustomer(data?.data ?? null);
			setRegistered(true);
		} catch (err) {
			showNotification({ type: "error", message: (err as ResultError)?.description ?? "ثبت درخواست با خطا مواجه شد" });
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-20 flex items-center justify-center gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال بارگذاری...
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-10 max-w-3xl">
			{/* hero */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-primary to-[#040e27] text-white p-8 mb-6">
				<div className="absolute -top-16 -left-10 w-64 h-64 rounded-full bg-secondary/20 blur-3xl" />
				<div className="relative flex items-center gap-4">
					<div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
						<IconDashboard className="stroke-white w-7 h-7" />
					</div>
					<div>
						<h1 className="peyda font-bold text-2xl">پنل مشتریان سازمانی رسمی‌یاب</h1>
						<p className="text-white/75 text-sm mt-1 leading-7">
							کسب‌وکار خود را ارتقا دهید؛ مدیریت مشتریان، ثبت سفارش گروهی و پیگیری یکپارچه.
						</p>
					</div>
				</div>
			</div>

			{registered || alreadyEnterprise ? (
				<div className="bg-white border border-success/40 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
					<div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
						<IconCheck className="stroke-success w-10 h-10" />
					</div>
					<div className="peyda font-bold text-xl text-primary">
						{registered ? "درخواست شما با موفقیت ثبت شد" : "شما مشتری سازمانی هستید"}
					</div>
					<div className="text-sm text-neutral-500 leading-7 max-w-md">
						{registered
							? "درخواست مشتری سازمانی شما ثبت شد. اکنون می‌توانید وارد پنل سازمانی خود شوید و مشتریان و سفارش‌هایتان را مدیریت کنید."
							: "هم‌اکنون می‌توانید از پنل سازمانی خود استفاده کنید."}
					</div>
					<TabanButton isLink href="/enterprise-customers/profile" className="mt-2">
						ورود به پنل سازمانی
					</TabanButton>
				</div>
			) : !profileCompleted ? (
				<div className="bg-white border border-secondary/40 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
					<div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center">
						<IconInfo className="stroke-secondary w-8 h-8" />
					</div>
					<div className="peyda font-bold text-lg text-primary">ابتدا پروفایل خود را تکمیل کنید</div>
					<div className="text-sm text-neutral-500 leading-7 max-w-md">
						برای ثبت درخواست مشتری سازمانی، لازم است اطلاعات حساب کاربری شما کامل باشد.
					</div>
					<TabanButton isLink href="/profile/complete">
						تکمیل پروفایل
					</TabanButton>
				</div>
			) : (
				<div className="bg-white border border-neutral-200 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col gap-5">
					<div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
						<IconDashboard className="stroke-primary w-5 h-5" />
						<h2 className="font-semibold peyda">اطلاعات موسسه</h2>
					</div>
					<TabanInput
						label="نام موسسه"
						name="institutionName"
						groupMode
						setValue={setFormValues}
						value={formValues.institutionName}
						disabled={registerPending}
						isHandleError
						hasError={!!findError(formErrors, "institutionName")}
						errorText={findError(formErrors, "institutionName")?.message}
					/>
					<TabanTextarea
						label="آدرس موسسه"
						name="institutionAddress"
						groupMode
						minHeight={90}
						setValue={setFormValues}
						value={formValues.institutionAddress}
						disabled={registerPending}
						isHandleError
						hasError={!!findError(formErrors, "institutionAddress")}
						errorText={findError(formErrors, "institutionAddress")?.message}
					/>
					<TabanInput
						label="شناسه ثبت (اختیاری)"
						name="registrationId"
						groupMode
						isLtr
						setValue={setFormValues}
						value={formValues.registrationId}
						disabled={registerPending}
					/>
					<div className="flex justify-end pt-2">
						<TabanButton onClick={submitHandler} isLoading={registerPending} loadingText="در حال ثبت...">
							ثبت درخواست مشتری سازمانی
						</TabanButton>
					</div>
				</div>
			)}
		</div>
	);
}
