"use client";

import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconArrowLine } from "@/app/_components/icon/icons";
import useReadSearchParams from "@/hooks/useReadSearchParams";
import { useNotificationStore } from "@/stores/notification.store";
import { FormErrors } from "@/types/formErrors.type";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { findError } from "@/utils/formErrorsFinder";
import MobileTopHeader from "@/app/_components/mobileTopHeader/mobileTopHeader";
import { useRouter } from "next/navigation";
import { SetPasswordFormValues } from "../../_types/setPasswordFormValues.type";
import { passwordRegex } from "@/utils/passwordRegex";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";
import { mobileRegex } from "@/utils/mobileRegex";
import { useApi } from "@/hooks/useApi";
import { AuthEndpoints } from "../../_api/endpoints";
import Link from "next/link";
import { CompleteProfileFormValues } from "../../_types/completeProfileFormValues.type";
import TabanAutoComplete from "@/app/_components/common/tabanAutoComplete/tabanAutoComplete";
import { LabelValue } from "@/types/labelValue.type";
import { genders } from "@/constants/genders";
import TabanDatePicker from "@/app/_components/memarDatePicker/tabanDatePicker";
import { Province } from "@/types/Province.type";
import { City } from "@/types/city.type";
import { referralSource } from "@/constants/referralSource";
import TabanAutocompleteWrapper from "@/app/_components/common/tabanAutocompleteWrapper/tabanAutocompleteWrapper";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import ErrorModal from "@/app/_components/errorModal/errorModal";
let searchTimeout: ReturnType<typeof setTimeout>;

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<CompleteProfileFormValues>({});
	const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
	const [selectedReferralSource, setSelectedReferralSource] = useState<LabelValue | null>(null);
	const [selectedCity, setSelectedCity] = useState<City | null>(null);
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username", "backUrl"]);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [retryCompleteProfile, setRetryCompleteProfile] = useState<boolean>(false);

	const {
		result: provincesResult,
		resultData: provincesResultData,
		fetchData: executeprovinces,
		loading: provincesLoading,
	} = useApi(async (term: string) => await AuthEndpoints.getProvinces(term));

	const {
		result: citiesResult,
		resultData: citiesResultData,
		fetchData: executeCities,
		loading: citiesLoading,
	} = useApi(async (term: string, provinceId?: number) => await AuthEndpoints.getCities(term, provinceId));
	const {
		result: completeProfileResult,
		fetchData: completeProfile,
		loading: completeProfileLoading,
	} = useApi(async (formValues: CompleteProfileFormValues) => await AuthEndpoints.completeProfile(formValues));

	useEffect(() => {
		setFormValues((prev) => ({ ...prev, username: !!searchParams?.username ? searchParams?.username : undefined }));
		executeprovinces("");
	}, []);

	useEffect(() => {
		executeCities("", selectedProvince?.id ?? undefined);
		setSelectedCity(null);
	}, [selectedProvince]);

	useEffect(() => {
		if (formSubmited) {
			formValidator();
		}
	}, [formValues, selectedDate, selectedProvince, selectedCity, selectedReferralSource]);

	const createUserPayload = () => {
		const newFormValues: CompleteProfileFormValues = {
			...formValues,
			profilePic: "",
			birthDate: selectedDate ?? "",
			province: selectedProvince?.id ?? undefined,
			city: selectedCity?.id ?? undefined,
			referralSource: selectedReferralSource?.value ?? "",
		};
		return newFormValues;
	};

	const setPasswordHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const errors = formValidator();
		if (errors?.length === 0) {
			completeProfile(createUserPayload());
		}
	};

	useEffect(() => {
		if (completeProfileResult) {
			if (completeProfileResult?.success) {
				if (searchParams?.backUrl) {
					window.location.href = searchParams?.backUrl;
				} else {
					window.location.href = "/";
				}
			} else {
				isRetryAble(completeProfileResult?.code) && setRetryCompleteProfile(true);
				showNotification({
					type: "error",
					message: completeProfileResult?.description ?? "تکمیل پروفایل با خطا مواجه شد",
				});
			}
		}
	}, [completeProfileResult]);
	useEffect(() => {
		if (provincesResult) {
			if (provincesResult?.success) {
			} else {
				showNotification({
					type: "error",
					message: provincesResult?.description ?? "دریافت استان ها با خطا مواجه شد",
				});
			}
		}
	}, [provincesResult]);
	useEffect(() => {
		if (citiesResult) {
			if (citiesResult?.success) {
			} else {
				showNotification({
					type: "error",
					message: citiesResult?.description ?? "دریافت استان ها با خطا مواجه شد",
				});
			}
		}
	}, [citiesResult]);

	const formValidator = () => {
		const newErrors: FormErrors[] = [];
		!formValues?.firstName && newErrors.push({ item: `firstName`, message: "وارد کردن نام الزامی است" });
		!formValues?.lastName && newErrors.push({ item: `lastName`, message: "وارد کردن نلم خانوادگی الزامی است" });
		!selectedDate && newErrors.push({ item: `birthDate`, message: "وارد کردن تاریخ تولد الزامی است" });
		!selectedProvince && newErrors.push({ item: `province`, message: "وارد کردن rrrrr الزامی است" });
		!selectedCity && newErrors.push({ item: `city`, message: "وارد کردن rrrrr الزامی است" });
		!selectedReferralSource && newErrors.push({ item: `referralSource`, message: "وارد کردن rrrrr الزامی است" });

		setFormErrors(newErrors);

		newErrors?.length > 0 ? setFormDisabled(true) : setFormDisabled(false);
		return newErrors;
	};

	return (
		<div className="w-full lg:!p-6 lg:!border border-secondary rounded-2xl h-full bg-white">
			<MobileTopHeader pageName="" hasBAck backUrl="/auth" />
			<form className="max-lg:!p-4 h-full flex flex-col max-lg:!-mt-16 w-full max-lg:!pb-4" onSubmit={setPasswordHandler}>
				<div className="max-lg:!min-h-[calc(100dvh-76px)] w-full">
					<div className="w-full flex justify-center relative">
						<TabanButton
							className="absolute right-0 top-[8px] max-lg:!hidden"
							variant="icon"
							onClick={() => router.push("/auth")}
						>
							<IconArrowLine className="rotate-180" height={28} width={28} />
						</TabanButton>
						<Link href="/">
							<Image src="/images/logo2.svg" width={72} height={72} alt="logo" />
						</Link>
					</div>
					<div className="font-semibold text-xl mt-5 text-center peyda">تکمیل پروفایل</div>
					<div className="mt-1 text-center">برای دسترسی به امکانات سایت، لطفا پروفایل خود را کامل کنید</div>
					<div className="mt-4 flex items-start gap-4 w-full max-lg:!flex-col max-lg:!gap-1">
						<TabanInput
							disabled={completeProfileLoading}
							value={formValues?.firstName}
							groupMode
							setValue={setFormValues}
							name="firstName"
							label="نام"
							isHandleError
							hasError={!!findError(formErrors, "firstName")}
							errorText={findError(formErrors, "firstName")?.message}
						/>
						<TabanInput
							disabled={completeProfileLoading}
							value={formValues?.lastName}
							groupMode
							setValue={setFormValues}
							name="lastName"
							label="نام خانوادگی"
							isHandleError
							hasError={!!findError(formErrors, "lastName")}
							errorText={findError(formErrors, "lastName")?.message}
						/>
						<div className="w-full">
							<TabanDatePicker
								placeholder="تاریخ تولد"
								selectedDate={selectedDate}
								setSelectedDate={setSelectedDate}
							/>
							{!!findError(formErrors, `birthDate`) && (
								<div className="text-error text-xs mt-1">{findError(formErrors, `birthDate`)?.message}</div>
							)}
						</div>
					</div>
					<div className="mt-1 flex items-start gap-4 w-full  max-lg:!flex-col max-lg:!gap-1 max-lg:!mt-6">
						<TabanInput
							disabled={completeProfileLoading}
							value={formValues?.email}
							groupMode
							setValue={setFormValues}
							name="email"
							label="ایمیل"
							isHandleError
							hasError={!!findError(formErrors, "email")}
							errorText={findError(formErrors, "email")?.message}
						/>
						<TabanAutocompleteWrapper
							scrolled
							height={200}
							label="استان"
							name="province"
							options={provincesResultData?.data?.elements ?? []}
							selectedOption={selectedProvince}
							setSelectedOption={setSelectedProvince}
							valueField="id"
							displayField="name"
							inputOnChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								!!searchTimeout && clearTimeout(searchTimeout);
								searchTimeout = setTimeout(() => {
									executeprovinces(e.target.value);
								}, 500);
							}}
							isHandleError
							hasError={!!findError(formErrors, "province")}
							errorText={findError(formErrors, "province")?.message}
							executeFunction={() => executeprovinces("")}
							resultStatus={provincesResult?.success}
						/>
						<TabanAutocompleteWrapper
							scrolled
							height={200}
							label="شهر"
							name="city"
							options={citiesResultData?.data?.elements ?? []}
							selectedOption={selectedCity}
							setSelectedOption={setSelectedCity}
							valueField="id"
							displayField="name"
							inputOnChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								!!searchTimeout && clearTimeout(searchTimeout);
								searchTimeout = setTimeout(() => {
									executeCities(e.target.value, selectedProvince?.id ?? undefined);
								}, 500);
							}}
							isHandleError
							hasError={!!findError(formErrors, "city")}
							errorText={findError(formErrors, "city")?.message}
							executeFunction={() => executeCities("", selectedProvince?.id ?? undefined)}
							resultStatus={citiesResult?.success}
						/>
					</div>
					<div className="mt-1 flex items-start gap-4 w-full max-lg:!flex-col max-lg:!gap-1">
						<TabanAutoComplete
							scrolled
							height={200}
							label="راه آشنایی با ما"
							name="referralSource"
							options={referralSource}
							selectedOption={selectedReferralSource}
							setSelectedOption={setSelectedReferralSource}
							valueField="value"
							displayField="label"
							isHandleError
							hasError={!!findError(formErrors, "referralSource")}
							errorText={findError(formErrors, "referralSource")?.message}
						/>

						<TabanInput
							disabled={completeProfileLoading}
							value={formValues?.nationalId}
							groupMode
							setValue={setFormValues}
							name="nationalId"
							label="کد ملی"
							isHandleError
							hasError={!!findError(formErrors, "nationalId")}
							errorText={findError(formErrors, "nationalId")?.message}
						/>
						<div className="w-full"></div>
					</div>
				</div>
				<div className="mt-1 flex flex-col items-center gap-2 w-full">
					<TabanButton
						isLoading={completeProfileLoading}
						loadingText="در حال ورود"
						type="submit"
						className="!w-full"
						disabled={formDisabled || completeProfileLoading}
					>
						ورود
					</TabanButton>
				</div>
			</form>
			<ErrorModal
				open={retryCompleteProfile}
				setOpen={setRetryCompleteProfile}
				executeFunction={() => {
					completeProfile(createUserPayload());
				}}
				title="تکمیل پروفایل"
				errorText="خطایی هنگام تکمیل پروفایل رخ داد"
			/>
		</div>
	);
}
