"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { useProfiletore } from "@/stores/profile";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { FormErrors } from "@/types/formErrors.type";
import { findError } from "@/utils/formErrorsFinder";
import { Profile } from "@/types/profile.type";
import { Language } from "@/types/language.type";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanAutocompleteWrapper from "@/app/_components/common/tabanAutocompleteWrapper/tabanAutocompleteWrapper";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import FileUploader from "@/app/_components/common/fileUploader/fileUploader";
import {
	IconCircleUser,
	IconCross,
	IconRequired,
	IconStar,
	IconUser,
} from "@/app/_components/icon/icons";
import {
	CompleteProfileFormValues,
	ReferralSourceOption,
	SelectedLanguage,
	UserTypeOption,
} from "../../../_types/completeProfileForm.type";
import { referralSourceOptions } from "../../../_constants/referralSource";
import { ProfileEndpoints } from "../../../_api/endpoint";
import { UpdateUserPayload } from "../../../_types/updateUserPayload.type";

const userTypeOptions: UserTypeOption[] = [
	{ label: "حقیقی", value: "individual" },
	{ label: "حقوقی", value: "legal" },
];

export default function CompleteProfileForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const backUrl = searchParams.get("backUrl");
	const showNotification = useNotificationStore((state) => state.showNotification);
	const { profile, setProfile } = useProfiletore();

	const [formValues, setFormValues] = useState<CompleteProfileFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

	const [selectedUserType, setSelectedUserType] = useState<UserTypeOption | null>(null);
	const [selectedReferralSource, setSelectedReferralSource] = useState<ReferralSourceOption | null>(
		null,
	);
	const [selectedLanguages, setSelectedLanguages] = useState<SelectedLanguage[]>([]);
	const [languageAutoOption, setLanguageAutoOption] = useState<Language | null>(null);
	// کد معرف فقط یک‌بار قابل ثبت است؛ اگر قبلاً ثبت شده باشد، ورودی قفل می‌شود
	const [referralLocked, setReferralLocked] = useState<boolean>(false);
	// کد ملی فقط یک‌بار گرفته می‌شود؛ اگر مقدار داشته باشد قفل و فقط نمایش داده می‌شود
	const [nationalIdLocked, setNationalIdLocked] = useState<boolean>(false);
	// قانون جدید: فیلدی که هنگام بارگذاری مقدار داشته اجباری می‌ماند؛ فیلد خالی اختیاری است
	const [initiallyFilled, setInitiallyFilled] = useState<Record<string, boolean>>({});

	const [profilePicFiles, setProfilePicFiles] = useState<File[]>([]);
	const [uploadedProfilePic, setUploadedProfilePic] = useState<string>("");
	const [uploadingPic, setUploadingPic] = useState<boolean>(false);

	const {
		resultData: profileResultData,
		fetchData: executeProfile,
		loading: profileLoading,
	} = useApi(async () => await TabanEndpoints.getProfile());

	const { resultData: languagesResultData, fetchData: executeLanguages, loading: languagesLoading } =
		useApi(async () => await ProfileEndpoints.getLanguages());

	const {
		result: updateResult,
		fetchData: executeUpdate,
		loading: updateLoading,
	} = useApi(async (payload: UpdateUserPayload) => await ProfileEndpoints.updateUser(payload));

	// پس از تکمیل پروفایل، پروفایل را دوباره از سرور می‌گیریم تا استور و درصد تکمیل تازه شوند
	const refreshProfileApi = useApi(async () => await TabanEndpoints.getProfile());

	useEffect(() => {
		executeProfile();
		executeLanguages();
	}, []);

	// Hydrate the form once the profile is fetched
	useEffect(() => {
		const data = profileResultData?.data;
		if (!data) return;

		setFormValues({
			firstName: data.firstName ?? "",
			lastName: data.lastName ?? "",
			nationalId: data.nationalId ?? "",
			specialtyField: data.specialtyField ?? "",
			referralCode: data.referralCode ?? "",
		});

		// اگر کد معرف از قبل ثبت شده باشد، دیگر قابل ویرایش نیست
		setReferralLocked(!!data.referralCode);
		// کد ملی در صورت داشتن مقدار، قفل می‌شود
		setNationalIdLocked(!!data.nationalId);
		// فیلدهایی که هنگام بارگذاری مقدار داشته‌اند، اجباری باقی می‌مانند (تصویر پروفایل استثناست)
		setInitiallyFilled({
			firstName: !!data.firstName,
			lastName: !!data.lastName,
			nationalId: !!data.nationalId,
			userType: !!data.userType,
			requiredLanguages: !!data.requiredLanguages?.length,
			specialtyField: !!data.specialtyField,
			referralSource: !!data.referralSource,
		});

		if (data.userType) {
			setSelectedUserType(userTypeOptions.find((o) => o.value === data.userType) ?? null);
		}

		if (data.referralSource) {
			const found = referralSourceOptions.find((o) => o.value === data.referralSource);
			setSelectedReferralSource(
				found ?? { label: data.referralSource, value: data.referralSource },
			);
		}

		if (data.profilePic) {
			setUploadedProfilePic(data.profilePic);
		}
	}, [profileResultData]);

	// Hydrate selected languages once the profile is fetched.
	// requiredLanguages اکنون از بک‌اند به صورت آبجکت کامل زبان می‌آید (نه آیدی خام).
	useEffect(() => {
		const profileData = profileResultData?.data;
		if (!profileData?.requiredLanguages?.length) return;
		if (selectedLanguages.length > 0) return;

		const hydrated: SelectedLanguage[] = profileData.requiredLanguages.map((lang) => ({
			languageId: lang.languageId,
			languageName: lang.languageName,
		}));
		setSelectedLanguages(hydrated);
	}, [profileResultData]);

	useEffect(() => {
		if (formSubmitted) formValidator();
	}, [formValues, selectedUserType, selectedReferralSource, selectedLanguages, uploadedProfilePic]);

	useEffect(() => {
		if (!updateResult) return;
		if (updateResult.success) {
			showNotification({
				type: "success",
				message: updateResult.data?.message ?? "پروفایل با موفقیت ذخیره شد",
			});
			// پروفایل را تازه از سرور می‌خوانیم و در استور می‌نشانیم تا درصد تکمیل (که به تغییر
			// پروفایل واکنش نشان می‌دهد، مثل منوی هدر) بدون نیاز به رفرش دستی به‌روز شود.
			(async () => {
				const refreshed = await refreshProfileApi.fetchDataResult();
				if (refreshed.success) {
					setProfile((refreshed.data?.data as Profile) ?? null);
				}
				router.push(backUrl || "/profile/info");
			})();
		} else {
			showNotification({
				type: "error",
				message: updateResult.description ?? "به‌روزرسانی پروفایل با خطا مواجه شد",
			});
		}
	}, [updateResult]);

	const languages: Language[] = languagesResultData?.data ?? [];
	const availableLanguages = useMemo(() => {
		const selectedIds = new Set(selectedLanguages.map((l) => l.languageId));
		return languages.filter((l) => !selectedIds.has(l.languageId));
	}, [languages, selectedLanguages]);

	const addLanguage = (option: Language | null) => {
		if (!option) return;
		if (!selectedLanguages.some((l) => l.languageId === option.languageId)) {
			setSelectedLanguages((prev) => [
				...prev,
				{ languageId: option.languageId, languageName: option.languageName },
			]);
		}
		setTimeout(() => setLanguageAutoOption(null), 0);
	};

	const removeLanguage = (languageId: string) => {
		setSelectedLanguages((prev) => prev.filter((l) => l.languageId !== languageId));
	};

	const formValidator = (): FormErrors[] => {
		const errors: FormErrors[] = [];
		// فیلدی فقط در صورتی اجباری است که هنگام بارگذاری مقدار داشته باشد؛ یعنی نباید خالی شود
		const required = (key: string) => !!initiallyFilled[key];

		if (required("firstName") && !formValues.firstName?.trim()) {
			errors.push({ item: "firstName", message: "نام نمی‌تواند خالی بماند" });
		}
		if (required("lastName") && !formValues.lastName?.trim()) {
			errors.push({ item: "lastName", message: "نام خانوادگی نمی‌تواند خالی بماند" });
		}
		// کد ملی: در صورت قفل بودن قابل تغییر نیست؛ اگر مقدار وارد شده باشد باید ۱۰ رقم باشد
		if (formValues.nationalId?.trim() && !/^\d{10}$/.test(formValues.nationalId.trim())) {
			errors.push({ item: "nationalId", message: "کد ملی باید ۱۰ رقم عددی باشد" });
		} else if (required("nationalId") && !formValues.nationalId?.trim()) {
			errors.push({ item: "nationalId", message: "کد ملی نمی‌تواند خالی بماند" });
		}
		if (required("userType") && !selectedUserType) {
			errors.push({ item: "userType", message: "نوع کاربری نمی‌تواند خالی بماند" });
		}
		if (required("requiredLanguages") && selectedLanguages.length === 0) {
			errors.push({ item: "requiredLanguages", message: "حداقل یک زبان مورد نیاز را انتخاب کنید" });
		}
		if (required("specialtyField") && !formValues.specialtyField?.trim()) {
			errors.push({ item: "specialtyField", message: "حوزه تخصصی نمی‌تواند خالی بماند" });
		}
		if (required("referralSource") && !selectedReferralSource) {
			errors.push({ item: "referralSource", message: "نحوه آشنایی با ما نمی‌تواند خالی بماند" });
		}
		setFormErrors(errors);
		return errors;
	};

	const uploadProfilePic = async () => {
		if (profilePicFiles.length === 0) return;
		setUploadingPic(true);
		try {
			const urls = await TabanEndpoints.uploadStorageFiles(profilePicFiles, "profile");
			if (urls?.[0]) {
				setUploadedProfilePic(urls[0]);
				setProfilePicFiles([]);
				showNotification({ type: "success", message: "تصویر پروفایل آپلود شد" });
			} else {
				throw new Error();
			}
		} catch {
			showNotification({ type: "error", message: "آپلود تصویر پروفایل با خطا مواجه شد" });
		} finally {
			setUploadingPic(false);
		}
	};

	const removeProfilePic = () => {
		setUploadedProfilePic("");
	};

	const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormSubmitted(true);
		const errors = formValidator();
		if (errors.length > 0) {
			showNotification({
				type: "error",
				message: "لطفا موارد لازم در فرم را تکمیل کنید",
			});
			return;
		}

		// فقط مقادیر موجود ارسال می‌شوند؛ فیلدهای اختیاریِ خالی دست‌نخورده باقی می‌مانند.
		// شماره تماس دیگر در این فرم گرفته نمی‌شود. تصویر پروفایل همیشه ارسال می‌شود تا افزودن/حذف اعمال شود.
		const payload: UpdateUserPayload = {
			referralCode: formValues.referralCode?.trim() || "",
			requiredLanguages: selectedLanguages.map((l) => l.languageId),
			profilePic: uploadedProfilePic,
		};
		if (formValues.firstName?.trim()) payload.firstName = formValues.firstName.trim();
		if (formValues.lastName?.trim()) payload.lastName = formValues.lastName.trim();
		if (formValues.nationalId?.trim()) payload.nationalId = formValues.nationalId.trim();
		if (selectedUserType) payload.userType = selectedUserType.value;
		if (formValues.specialtyField?.trim()) payload.specialtyField = formValues.specialtyField.trim();
		if (selectedReferralSource) payload.referralSource = selectedReferralSource.value;

		executeUpdate(payload);
	};

	if (profileLoading && !profileResultData) {
		return (
			<div className="bg-white border border-neutral-200 rounded-2xl p-10 flex items-center justify-center gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال دریافت اطلاعات...
			</div>
		);
	}

	return (
		<form onSubmit={submitHandler} className="flex flex-col gap-5">
			{/* اطلاعات شخصی */}
			<section className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 shadow-sm">
				<div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-5">
					<IconUser stroke="#1a3047" />
					<h2 className="font-semibold peyda">اطلاعات شخصی</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<TabanInput
						label="نام"
						name="firstName"
						groupMode
						setValue={setFormValues}
						value={formValues.firstName}
						disabled={updateLoading}
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
						disabled={updateLoading}
						isHandleError
						hasError={!!findError(formErrors, "lastName")}
						errorText={findError(formErrors, "lastName")?.message}
					/>
					<div>
						<TabanInput
							label="کد ملی"
							name="nationalId"
							groupMode
							setValue={setFormValues}
							value={formValues.nationalId}
							isLtr
							disabled={updateLoading || nationalIdLocked}
							isHandleError
							hasError={!!findError(formErrors, "nationalId")}
							errorText={findError(formErrors, "nationalId")?.message}
						/>
						{nationalIdLocked && (
							<div className="text-xs text-neutral-500 mt-1">کد ملی ثبت شده و قابل تغییر نیست.</div>
						)}
					</div>
				</div>
			</section>

			{/* تصویر پروفایل */}
			<section className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 shadow-sm">
				<div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-5">
					<IconCircleUser stroke="#1a3047" />
					<h2 className="font-semibold peyda">تصویر پروفایل</h2>
				</div>
				<div className="flex flex-col md:flex-row gap-5 items-stretch md:items-center">
					<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/15 bg-primary/5 flex items-center justify-center shrink-0 mx-auto md:mx-0">
						{uploadedProfilePic ? (
							<img
								src={uploadedProfilePic}
								alt="profile"
								className="w-full h-full object-cover"
							/>
						) : (
							<IconCircleUser width={56} height={56} stroke="#1a3047" />
						)}
					</div>
					<div className="flex-1">
						{uploadedProfilePic ? (
							<div className="flex items-center justify-between gap-3 bg-success/5 border border-success/40 rounded-lg p-3">
								<div className="text-sm text-success font-medium">
									تصویر پروفایل با موفقیت آپلود شد
								</div>
								<TabanButton variant="bordered" onClick={removeProfilePic}>
									حذف
								</TabanButton>
							</div>
						) : (
							<>
								<FileUploader
									files={profilePicFiles}
									onChange={setProfilePicFiles}
									multiple={false}
									allowedExtensions={["PNG", "JPG", "WEBP"]}
									accept="image/*"
									isLoading={uploadingPic}
									hasError={!!findError(formErrors, "profilePic")}
									errorText={findError(formErrors, "profilePic")?.message}
									hint="تصویر پروفایل خود را اینجا رها کنید یا برای انتخاب کلیک کنید"
								/>
								{profilePicFiles.length > 0 && (
									<div className="mt-3 flex justify-end">
										<TabanButton
											isLoading={uploadingPic}
											loadingText="در حال آپلود..."
											onClick={uploadProfilePic}
										>
											آپلود تصویر
										</TabanButton>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</section>

			{/* نوع کاربری و حوزه تخصصی */}
			<section className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 shadow-sm">
				<div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-5">
					<IconStar width={20} height={20} className="fill-primary stroke-0" />
					<h2 className="font-semibold peyda">نوع کاربری و حوزه تخصصی</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<TabanAutocompleteWrapper
							label="نوع کاربری"
							hasInitialValue
							options={userTypeOptions}
							selectedOption={selectedUserType}
							setSelectedOption={setSelectedUserType}
							valueField="value"
							displayField="label"
							loading={false}
							disabled={updateLoading}
							wrapperErrorText=""
							resultStatus={true}
							isHandleError
							hasError={!!findError(formErrors, "userType")}
							errorText={findError(formErrors, "userType")?.message}
						/>
					</div>
					<TabanInput
						label="حوزه تخصصی"
						name="specialtyField"
						groupMode
						setValue={setFormValues}
						value={formValues.specialtyField}
						disabled={updateLoading}
						isHandleError
						hasError={!!findError(formErrors, "specialtyField")}
						errorText={findError(formErrors, "specialtyField")?.message}
					/>
				</div>
			</section>

			{/* زبان‌های مورد نیاز */}
			<section className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 shadow-sm">
				<div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-5">
					<IconStar width={20} height={20} className="fill-primary stroke-0" />
					<h2 className="font-semibold peyda">زبان‌های مورد نیاز شما</h2>
				</div>
				<div className="flex flex-col gap-3">
					<TabanAutocompleteWrapper
						label="زبان مورد نظر را انتخاب کنید"
						options={availableLanguages}
						selectedOption={languageAutoOption}
						setSelectedOption={setLanguageAutoOption}
						valueField="languageId"
						displayField="languageName"
						loading={languagesLoading}
						onChange={addLanguage}
						wrapperErrorText=""
						resultStatus={true}
					/>
					{!!findError(formErrors, "requiredLanguages") && selectedLanguages.length === 0 && (
						<div className="text-error text-xs flex items-center gap-1">
							<IconRequired
								viewBox="0 0 100 100"
								width={14}
								height={14}
								className="fill-error stroke-0"
							/>
							{findError(formErrors, "requiredLanguages")?.message}
						</div>
					)}
					{selectedLanguages.length > 0 && (
						<div className="flex flex-wrap gap-2 pt-1">
							{selectedLanguages.map((lang) => (
								<div
									key={lang.languageId}
									className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
								>
									<span>{lang.languageName}</span>
									<button
										type="button"
										onClick={() => removeLanguage(lang.languageId)}
										className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-error/10 duration-150"
									>
										<IconCross
											strokeOpacity={0}
											width={14}
											height={14}
											className="fill-error"
										/>
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</section>

			{/* آشنایی و کد معرف */}
			<section className="bg-white border border-neutral-200 rounded-2xl p-5 lg:p-6 shadow-sm">
				<div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-5">
					<IconStar width={20} height={20} className="fill-primary stroke-0" />
					<h2 className="font-semibold peyda">آشنایی با ما</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<TabanAutocompleteWrapper
							label="نحوه آشنایی با ما"
							hasInitialValue
							options={referralSourceOptions}
							selectedOption={selectedReferralSource}
							setSelectedOption={setSelectedReferralSource}
							valueField="value"
							displayField="label"
							loading={false}
							disabled={updateLoading}
							wrapperErrorText=""
							resultStatus={true}
							isHandleError
							hasError={!!findError(formErrors, "referralSource")}
							errorText={findError(formErrors, "referralSource")?.message}
						/>
					</div>
					<div>
						<TabanInput
							label="کد معرف (اختیاری)"
							name="referralCode"
							groupMode
							setValue={setFormValues}
							value={formValues.referralCode}
							isLtr
							disabled={updateLoading || referralLocked}
						/>
						{referralLocked && (
							<div className="text-xs text-neutral-500 mt-1">
								کد معرف ثبت شده و قابل تغییر نیست.
							</div>
						)}
					</div>
				</div>

				{/* Referral incentive */}
				<div className="mt-5 relative overflow-hidden rounded-xl border border-secondary/40 bg-gradient-to-l from-secondary/15 via-secondary/5 to-white p-4 lg:p-5">
					<div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-secondary/15 blur-2xl"></div>
					<div className="relative flex items-start gap-4">
						<div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-2xl">
							🎁
						</div>
						<div className="flex-1">
							<div className="font-semibold peyda text-primary">
								با کد معرف دوستانت رو خوشحال کن
							</div>
							<p className="text-xs text-neutral-700 mt-1 leading-7">
								اگه با معرفی یکی از دوستانت اینجا اومدی، کد معرف اون عزیز رو وارد کن. با{" "}
								<span className="font-bold text-secondary">اولین خریدت</span>، یک کد تخفیف{" "}
								<span className="font-bold text-secondary">۱۰٪ روی ترجمه پایه</span> به‌عنوان
								هدیه برای شخصی که تو رو معرفی کرده ارسال می‌شه.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* اکشن‌ها */}
			<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
				<TabanButton variant="bordered" isLink href={backUrl || "/profile"}>
					انصراف
				</TabanButton>
				<TabanButton
					type="submit"
					isLoading={updateLoading}
					loadingText="در حال ذخیره..."
					disabled={updateLoading || uploadingPic}
				>
					ذخیره اطلاعات
				</TabanButton>
			</div>
		</form>
	);
}
