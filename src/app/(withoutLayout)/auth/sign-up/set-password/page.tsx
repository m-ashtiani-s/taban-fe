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
import { createData, readData } from "@/core/http-service/http-service";
import { API_URL } from "@/config/global";
import { Res } from "@/types/responseType";
import MobileTopHeader from "@/app/_components/mobileTopHeader/mobileTopHeader";
import { useRouter } from "next/navigation";
import { SetPasswordFormValues } from "../../_types/setPasswordFormValues.type";
import { passwordRegex } from "@/utils/passwordRegex";
import { Login } from "../../_types/login.type";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<SetPasswordFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [setPsswordLoading, setSetPsswordLoading] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username", "backUrl"]);

	useEffect(() => {
		setFormValues((prev) => ({ ...prev, username: !!searchParams?.username ? searchParams?.username : undefined }));
	}, []);

	useEffect(() => {
		if (formSubmited) {
			const newErrors: FormErrors[] = [];
			!formValues?.username && newErrors.push({ item: `username`, message: "وارد کردن شماره تماس الزامی است" });
			!formValues?.password && newErrors.push({ item: `password`, message: "وارد کردن رمز عبور الزامی است" });
			!!formValues?.password &&
				!passwordRegex.test(formValues?.password) &&
				newErrors.push({ item: `password`, message: "رمز عبور باید 6 رقمی و شامل یک حرف و یک عدد باشد" });
			!formValues?.confirmPassword && newErrors.push({ item: `confirmPassword`, message: "وارد کردن تکرار رمز عبور الزامی است" });
			formValues?.confirmPassword &&
				formValues?.password &&
				formValues?.password !== formValues?.confirmPassword &&
				newErrors.push({ item: `confirmPassword`, message: "رمز عبور و تکرار آن مطابقت ندارد" });
			setFormErrors(newErrors);
			if (newErrors?.length === 0) {
				setFormDisabled(false);
			} else {
				setFormDisabled(true);
			}
		}
	}, [formValues]);

	const setPasswordHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const newErrors: FormErrors[] = [];
		!formValues?.username && newErrors.push({ item: `username`, message: "وارد کردن شماره تماس الزامی است" });
		!formValues?.password && newErrors.push({ item: `password`, message: "وارد کردن رمز عبور الزامی است" });
		!!formValues?.password &&
			!passwordRegex.test(formValues?.password) &&
			newErrors.push({ item: `password`, message: "رمز عبور باید 6 رقمی و شامل یک حرف و یک عدد باشد" });
		!formValues?.confirmPassword && newErrors.push({ item: `confirmPassword`, message: "وارد کردن تکرار رمز عبور الزامی است" });
		formValues?.confirmPassword &&
			formValues?.password &&
			formValues?.password !== formValues?.confirmPassword &&
			newErrors.push({ item: `confirmPassword`, message: "رمز عبور و تکرار آن مطابقت ندارد" });
		setFormErrors(newErrors);
		if (newErrors?.length === 0) {
			setFormDisabled(false);
			executeSetPassword();
		} else {
			setFormDisabled(true);
		}
	};

	console.log(searchParams?.backUrl)

	const executeSetPassword = async () => {
		try {
			setSetPsswordLoading(true);
			const res = await createData<SetPasswordFormValues, Res<Login>>(`${API_URL}v1/sign-up/set-password`, formValues);
			storage.set(StorageKey?.TOKEN, res?.data?.acceeToken!);
			storage.set(StorageKey?.USERNAME, JSON.stringify(res?.data?.username));
			if (res?.data) {
				if (searchParams?.backUrl) {
					window.location.href = searchParams?.backUrl;
				} else {
					window.location.href = "/";
				}
			}
		} catch (error: any) {
			console.warn(error);
			showNotification({
				type: "error",
				message: error?.message ?? "ورود با خطا مواجه شد",
			});
		} finally {
			setSetPsswordLoading(false);
		}
	};

	return (
		<div className="w-full lg:!p-6 lg:!border border-neutral-300 rounded-lg h-full max-lg:!h-screen flex items-center justify-center flex-col">
			<MobileTopHeader pageName="" hasBAck backUrl="/auth" />
			<form className="max-lg:!p-4 h-full flex justify-center flex-col max-lg:!-mt-16" onSubmit={setPasswordHandler}>
				<div className="w-full flex justify-center relative">
					<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon" isLink href="/auth">
						<IconArrowLine className="rotate-180" height={28} width={28} />
					</TabanButton>
					<Image src="/images/logo.svg" width={48} height={48} alt="logo" />
				</div>
				<div className="font-semibold text-xl mt-8">رمز عبور</div>
				<div className="mt-2">برای دسترسی به امکانات سایت، لطفا رمز عبور خود را وارد کنید</div>
				<div className="mt-6">
					<TabanInput
						isLtr
						isPasswordInput
						disabled={setPsswordLoading}
						value={formValues?.password}
						groupMode
						setValue={setFormValues}
						name="password"
						label="رمز عبور"
						isHandleError
						hasError={!!findError(formErrors, "password")}
						errorText={findError(formErrors, "password")?.message}
					/>
				</div>
				<div className="mt-4">
					<TabanInput
						isLtr
						isPasswordInput
						disabled={setPsswordLoading}
						value={formValues?.confirmPassword}
						groupMode
						setValue={setFormValues}
						name="confirmPassword"
						label="تکرار رمز عبور"
						isHandleError
						hasError={!!findError(formErrors, "confirmPassword")}
						errorText={findError(formErrors, "confirmPassword")?.message}
					/>
				</div>
				<div className="mt-10">
					<TabanButton
						isLoading={setPsswordLoading}
						loadingText="در حال ورود"
						type="submit"
						className="w-full"
						disabled={formDisabled || setPsswordLoading}
					>
						ورود
					</TabanButton>
				</div>
			</form>
		</div>
	);
}
