"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { ResultError } from "@/types/result";
import { useNotificationStore } from "@/stores/notification.store";
import { FormErrors } from "@/types/formErrors.type";
import { findError } from "@/utils/formErrorsFinder";
import { mobileRegex } from "@/utils/mobileRegex";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanCheckbox from "@/app/_components/common/tabanCheckbox/tabanCheckbox";
import TabanAutocompleteWrapper from "@/app/_components/common/tabanAutocompleteWrapper/tabanAutocompleteWrapper";
import { IconArrow, IconEdit, IconUser } from "@/app/_components/icon/icons";
import { CustomerEndpoints } from "../../../../_api/endpoint";
import { Customer, CustomerPayload } from "../../../../_types/customer.type";

type LocationOption = { id: number; name: string };
type FormValues = { firstName?: string; lastName?: string; nationalId?: string; phoneNumber?: string };

type CustomerFormProps = { mode: "create" | "edit"; customer?: Customer | null };

const BACK = "/enterprise-customers/profile/customers";

export default function CustomerForm({ mode, customer }: CustomerFormProps) {
	const router = useRouter();
	const showNotification = useNotificationStore((s) => s.showNotification);
	const isEdit = mode === "edit";

	const [formValues, setFormValues] = useState<FormValues>(() =>
		isEdit && customer
			? {
					firstName: customer.firstName ?? "",
					lastName: customer.lastName ?? "",
					nationalId: customer.nationalId ?? "",
					phoneNumber: customer.phoneNumber ?? "",
				}
			: {},
	);
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
	const [selectedProvince, setSelectedProvince] = useState<LocationOption | null>(
		isEdit && customer ? { id: customer.provinceCode, name: customer.provinceName } : null,
	);
	const [selectedCity, setSelectedCity] = useState<LocationOption | null>(
		isEdit && customer ? { id: customer.cityCode, name: customer.cityName } : null,
	);
	const [isActive, setIsActive] = useState<boolean>(isEdit && customer ? customer.isActive : true);
	const isInitialMount = useRef<boolean>(true);

	const provincesQuery = useQuery({
		queryKey: ["enterpriseCustomers", "provinces", ""],
		queryFn: () => withMappedError(() => CustomerEndpoints.getProvinces("")),
		retry: false,
	});
	const citiesQuery = useQuery({
		queryKey: ["enterpriseCustomers", "cities", selectedProvince?.id ?? null],
		queryFn: () => withMappedError(() => CustomerEndpoints.getCities("", selectedProvince!.id)),
		enabled: !!selectedProvince,
		retry: false,
	});
	const provincesLoading = provincesQuery.isFetching;
	const citiesLoading = citiesQuery.isFetching;

	const { mutateAsync: executeSubmit, isPending: submitLoading } = useMutation({
		mutationFn: (payload: CustomerPayload) =>
			withMappedError(() =>
				isEdit && customer
					? CustomerEndpoints.updateCustomer(customer.customerId, payload)
					: CustomerEndpoints.createCustomer(payload),
			),
	});

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		setSelectedCity(null);
	}, [selectedProvince]);

	useEffect(() => {
		if (formSubmitted) formValidator();
	}, [formValues, selectedProvince, selectedCity]);

	const provinceOptions: LocationOption[] = (provincesQuery.data?.data?.elements ?? []) as LocationOption[];
	const cityOptions: LocationOption[] = (citiesQuery.data?.data?.elements ?? []) as LocationOption[];

	const formValidator = (): FormErrors[] => {
		const errors: FormErrors[] = [];
		if (!formValues.firstName?.trim()) errors.push({ item: "firstName", message: "نام مشتری الزامی است" });
		if (!formValues.lastName?.trim()) errors.push({ item: "lastName", message: "نام خانوادگی مشتری الزامی است" });
		if (!formValues.nationalId?.trim()) errors.push({ item: "nationalId", message: "کد ملی الزامی است" });
		else if (!/^\d{10}$/.test(formValues.nationalId.trim())) errors.push({ item: "nationalId", message: "کد ملی باید ۱۰ رقم عددی باشد" });
		if (!formValues.phoneNumber?.trim()) errors.push({ item: "phoneNumber", message: "شماره تماس الزامی است" });
		else if (!mobileRegex.test(formValues.phoneNumber.trim())) errors.push({ item: "phoneNumber", message: "شماره تماس معتبر نیست" });
		if (!selectedProvince) errors.push({ item: "province", message: "انتخاب استان الزامی است" });
		if (!selectedCity) errors.push({ item: "city", message: "انتخاب شهر الزامی است" });
		setFormErrors(errors);
		return errors;
	};

	const submitHandler = async () => {
		setFormSubmitted(true);
		const errors = formValidator();
		if (errors.length > 0) {
			showNotification({ type: "error", message: "لطفا موارد لازم در فرم را تکمیل کنید" });
			return;
		}
		const payload: CustomerPayload = {
			firstName: formValues.firstName!.trim(),
			lastName: formValues.lastName!.trim(),
			nationalId: formValues.nationalId!.trim(),
			phoneNumber: formValues.phoneNumber!.trim(),
			provinceName: selectedProvince!.name,
			provinceCode: selectedProvince!.id,
			cityName: selectedCity!.name,
			cityCode: selectedCity!.id,
			isActive,
		};
		try {
			const data = await executeSubmit(payload);
			showNotification({ type: "success", message: data?.message ?? (isEdit ? "مشتری ویرایش شد" : "مشتری ایجاد شد") });
			router.push(BACK);
		} catch (err) {
			showNotification({ type: "error", message: (err as ResultError)?.description ?? "ثبت اطلاعات مشتری با خطا مواجه شد" });
		}
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => router.push(BACK)}
					className="w-10 h-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 duration-150"
				>
					<IconArrow className="rotate-90 stroke-neutral-600 fill-neutral-600" width={20} height={20} />
				</button>
				<div className="flex items-center gap-2 text-lg font-bold peyda text-primary">
					{isEdit ? "ویرایش مشتری" : "افزودن مشتری زیرمجموعه"}
				</div>
			</div>

			<div className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col gap-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<TabanInput
						label="نام"
						name="firstName"
						groupMode
						setValue={setFormValues}
						value={formValues.firstName}
						disabled={submitLoading}
						isHandleError
						hasError={!!findError(formErrors, "firstName")}
						errorText={findError(formErrors, "firstName")?.message}
					/>
					<TabanInput
						label="نام خانوادگی"
						name="lastName"
						groupMode
						setValue={setFormValues}
						value={formValues.lastName}
						disabled={submitLoading}
						isHandleError
						hasError={!!findError(formErrors, "lastName")}
						errorText={findError(formErrors, "lastName")?.message}
					/>
					<TabanInput
						label="کد ملی"
						name="nationalId"
						groupMode
						isLtr
						setValue={setFormValues}
						value={formValues.nationalId}
						disabled={submitLoading}
						isHandleError
						hasError={!!findError(formErrors, "nationalId")}
						errorText={findError(formErrors, "nationalId")?.message}
					/>
					<TabanInput
						label="شماره تماس"
						name="phoneNumber"
						groupMode
						isLtr
						setValue={setFormValues}
						value={formValues.phoneNumber}
						disabled={submitLoading}
						isHandleError
						hasError={!!findError(formErrors, "phoneNumber")}
						errorText={findError(formErrors, "phoneNumber")?.message}
					/>
					<TabanAutocompleteWrapper
						label="استان"
						name="province"
						options={provinceOptions}
						selectedOption={selectedProvince}
						setSelectedOption={setSelectedProvince}
						valueField="id"
						displayField="name"
						loading={provincesLoading}
						disabled={submitLoading}
						scrolled
						height={260}
						hasInitialValue={isEdit}
						wrapperErrorText=""
						resultStatus={true}
						isHandleError
						hasError={!!findError(formErrors, "province")}
						errorText={findError(formErrors, "province")?.message}
					/>
					<TabanAutocompleteWrapper
						label="شهر"
						name="city"
						options={cityOptions}
						selectedOption={selectedCity}
						setSelectedOption={setSelectedCity}
						valueField="id"
						displayField="name"
						loading={citiesLoading}
						disabled={submitLoading || !selectedProvince}
						scrolled
						height={260}
						hasInitialValue={isEdit}
						wrapperErrorText=""
						resultStatus={true}
						isHandleError
						hasError={!!findError(formErrors, "city")}
						errorText={findError(formErrors, "city")?.message}
					/>
				</div>

				<div className="flex items-center pt-1">
					<TabanCheckbox
						selected={isActive}
						disabled={submitLoading}
						onChange={(e) => setIsActive(e.target.checked)}
						label={<span className="text-sm font-medium">مشتری فعال باشد</span>}
					/>
				</div>

				<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-neutral-100">
					<TabanButton variant="bordered" onClick={() => router.push(BACK)} disabled={submitLoading}>
						انصراف
					</TabanButton>
					<TabanButton onClick={submitHandler} isLoading={submitLoading} loadingText="در حال ذخیره...">
						{isEdit ? "ذخیره تغییرات" : "ثبت مشتری"}
					</TabanButton>
				</div>
			</div>
		</div>
	);
}
