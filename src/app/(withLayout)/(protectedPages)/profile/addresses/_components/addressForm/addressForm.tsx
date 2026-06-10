"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { FormErrors } from "@/types/formErrors.type";
import { findError } from "@/utils/formErrorsFinder";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanTextarea from "@/app/_components/common/tabanTextarea/tabanTextarea";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanAutocompleteWrapper from "@/app/_components/common/tabanAutocompleteWrapper/tabanAutocompleteWrapper";
import { IconArrow, IconEdit, IconInfo, IconTruck, IconUser } from "@/app/_components/icon/icons";
import { ShippingAddressEndpoints } from "../../_api/endpoint";
import { ShippingAddress, ShippingAddressPayload } from "../../_types/shippingAddress.type";

type LocationOption = { id: number; name: string };

type FormValues = {
	title?: string;
	plaque?: string;
	unit?: string;
	fullAddress?: string;
	addressDescription?: string;
	landlineNumber?: string;
};

type AddressFormProps = {
	mode: "create" | "edit";
	address?: ShippingAddress | null;
};

function previewValue(value?: string | null) {
	return value && value.trim() ? value : "—";
}

export default function AddressForm({ mode, address }: AddressFormProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const backUrl = searchParams.get("backUrl");
	const showNotification = useNotificationStore((state) => state.showNotification);
	const isEdit = mode === "edit";

	const [formValues, setFormValues] = useState<FormValues>(() =>
		isEdit && address
			? {
					title: address.title ?? "",
					plaque: address.plaque ?? "",
					unit: address.unit ?? "",
					fullAddress: address.fullAddress ?? "",
					addressDescription: address.addressDescription ?? "",
					landlineNumber: address.landlineNumber ?? "",
				}
			: {},
	);
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
	const [selectedProvince, setSelectedProvince] = useState<LocationOption | null>(
		isEdit && address ? { id: address.provinceCode, name: address.provinceName } : null,
	);
	const [selectedCity, setSelectedCity] = useState<LocationOption | null>(
		isEdit && address ? { id: address.cityCode, name: address.cityName } : null,
	);
	const isInitialMount = useRef<boolean>(true);

	const { resultData: provincesData, fetchData: executeProvinces, loading: provincesLoading } = useApi(
		async () => await ShippingAddressEndpoints.getProvinces(""),
	);
	const {
		resultData: citiesData,
		fetchData: executeCities,
		loading: citiesLoading,
		setResult: setCitiesResult,
	} = useApi(async (provinceId: number) => await ShippingAddressEndpoints.getCities("", provinceId));

	const { fetchDataResult: executeSubmit, loading: submitLoading } = useApi(
		async (payload: ShippingAddressPayload) =>
			isEdit && address
				? await ShippingAddressEndpoints.updateShippingAddress(address.shippingAddressId, payload)
				: await ShippingAddressEndpoints.createShippingAddress(payload),
	);

	useEffect(() => {
		executeProvinces();
		if (isEdit && address) executeCities(address.provinceCode);
	}, []);

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		setCitiesResult(null);
		setSelectedCity(null);
		if (selectedProvince) executeCities(selectedProvince.id);
	}, [selectedProvince]);

	useEffect(() => {
		if (formSubmitted) formValidator();
	}, [formValues, selectedProvince, selectedCity]);

	const provinceOptions: LocationOption[] = (provincesData?.data?.elements ?? []) as LocationOption[];
	const cityOptions: LocationOption[] = (citiesData?.data?.elements ?? []) as LocationOption[];

	const formValidator = (): FormErrors[] => {
		const errors: FormErrors[] = [];
		if (!formValues.title?.trim()) errors.push({ item: "title", message: "عنوان آدرس الزامی است" });
		if (!selectedProvince) errors.push({ item: "province", message: "انتخاب استان الزامی است" });
		if (!selectedCity) errors.push({ item: "city", message: "انتخاب شهر الزامی است" });
		if (!formValues.fullAddress?.trim()) errors.push({ item: "fullAddress", message: "آدرس کامل الزامی است" });
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

		const payload: ShippingAddressPayload = {
			title: formValues.title!.trim(),
			provinceName: selectedProvince!.name,
			provinceCode: selectedProvince!.id,
			cityName: selectedCity!.name,
			cityCode: selectedCity!.id,
			plaque: formValues.plaque?.trim() || null,
			unit: formValues.unit?.trim() || null,
			fullAddress: formValues.fullAddress!.trim(),
			addressDescription: formValues.addressDescription?.trim() || null,
			landlineNumber: formValues.landlineNumber?.trim() || null,
		};

		const result = await executeSubmit(payload);
		if (result.success) {
			showNotification({
				type: "success",
				message: result.data?.message ?? (isEdit ? "آدرس با موفقیت ویرایش شد" : "آدرس با موفقیت ایجاد شد"),
			});
			router.push(backUrl || "/profile/addresses");
		} else {
			showNotification({ type: "error", message: result.description ?? "ثبت آدرس با خطا مواجه شد" });
		}
	};

	return (
		<div className="flex flex-col gap-5">
			{/* header */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => router.push(backUrl || "/profile/addresses")}
						className="w-10 h-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 duration-150"
					>
						<IconArrow className="rotate-90 stroke-neutral-600 fill-neutral-600" width={20} height={20} />
					</button>
					<div className="flex items-center gap-2 text-lg font-bold peyda text-primary">
						{isEdit ? <IconEdit width={22} height={22} className="stroke-primary" /> : <IconTruck width={24} height={24} className="stroke-primary" />}
						{isEdit ? "ویرایش آدرس" : "افزودن آدرس جدید"}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
				{/* form */}
				<div className="lg:col-span-2 flex flex-col gap-5">
					<section className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 shadow-sm">
						<div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-5">
							<IconInfo width={20} height={20} className="stroke-primary" />
							<h2 className="font-semibold peyda">اطلاعات کلی</h2>
						</div>
						<div className="flex flex-col gap-4">
							<TabanInput
								label="عنوان آدرس (مثلا منزل، محل کار)"
								name="title"
								groupMode
								setValue={setFormValues}
								value={formValues.title}
								disabled={submitLoading}
								isHandleError
								hasError={!!findError(formErrors, "title")}
								errorText={findError(formErrors, "title")?.message}
							/>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
						</div>
					</section>

					<section className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 shadow-sm">
						<div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-5">
							<IconTruck width={20} height={20} className="stroke-primary" />
							<h2 className="font-semibold peyda">جزئیات آدرس</h2>
						</div>
						<div className="flex flex-col gap-4">
							<TabanTextarea
								label="آدرس کامل"
								name="fullAddress"
								groupMode
								minHeight={90}
								setValue={setFormValues}
								value={formValues.fullAddress}
								disabled={submitLoading}
								isHandleError
								hasError={!!findError(formErrors, "fullAddress")}
								errorText={findError(formErrors, "fullAddress")?.message}
							/>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<TabanInput
									label="پلاک (اختیاری)"
									name="plaque"
									groupMode
									setValue={setFormValues}
									value={formValues.plaque}
									disabled={submitLoading}
								/>
								<TabanInput
									label="واحد (اختیاری)"
									name="unit"
									groupMode
									setValue={setFormValues}
									value={formValues.unit}
									disabled={submitLoading}
								/>
								<TabanInput
									label="شماره ثابت (اختیاری)"
									name="landlineNumber"
									groupMode
									isLtr
									setValue={setFormValues}
									value={formValues.landlineNumber}
									disabled={submitLoading}
								/>
							</div>
							<TabanTextarea
								label="توضیحات آدرس (اختیاری)"
								name="addressDescription"
								groupMode
								minHeight={80}
								setValue={setFormValues}
								value={formValues.addressDescription}
								disabled={submitLoading}
							/>
						</div>
					</section>

					<div className="flex  flex-row justify-end gap-3">
						<TabanButton variant="bordered" onClick={() => router.push(backUrl || "/profile/addresses")} disabled={submitLoading}>
							انصراف
						</TabanButton>
						<TabanButton onClick={submitHandler} isLoading={submitLoading} loadingText="در حال ذخیره...">
							{isEdit ? "ذخیره تغییرات" : "ثبت آدرس"}
						</TabanButton>
					</div>
				</div>

				{/* live preview */}
				<div className="lg:col-span-1 lg:sticky lg:top-[88px] max-lg:hidden">
					<div className="text-xs text-neutral-400 mb-2 flex items-center gap-1.5">
						<IconUser width={14} height={14} className="stroke-neutral-400" />
						پیش‌نمایش آدرس
					</div>
					<div className="relative bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 overflow-hidden">
						<div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-primary to-primary/60" />
						<div className="flex items-center gap-2 pt-1">
							<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
								<IconTruck width={20} height={20} className="stroke-primary" />
							</div>
							<div className="font-semibold peyda text-primary truncate">
								{previewValue(formValues.title)}
							</div>
						</div>
						<div className="flex flex-col gap-2 text-sm">
							<div className="flex items-center gap-1.5">
								<span className="text-neutral-400">استان/شهر:</span>
								<span className="font-medium text-neutral-800">
									{selectedProvince?.name ?? "—"} - {selectedCity?.name ?? "—"}
								</span>
							</div>
							<div className="text-neutral-700 leading-7">
								<span className="text-neutral-400">آدرس: </span>
								{previewValue(formValues.fullAddress)}
							</div>
							<div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
								<span>پلاک: {previewValue(formValues.plaque)}</span>
								<span>واحد: {previewValue(formValues.unit)}</span>
								<span dir="ltr">تلفن ثابت: {previewValue(formValues.landlineNumber)}</span>
							</div>
							{formValues.addressDescription?.trim() && (
								<div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2 leading-6">
									{formValues.addressDescription}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
