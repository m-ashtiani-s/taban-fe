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
import { CheckUsernameFormValues } from "./_types/checkUsernameFormValues.type";

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<CheckUsernameFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [loginLoading, setLoginLoading] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username"]);

	useEffect(() => {
		if (formSubmited) {
			const newErrors: FormErrors[] = [];
			!formValues?.username && newErrors.push({ item: `username`, message: "وارد کردن شماره تماس الزامی است" });
			setFormErrors(newErrors);
			if (newErrors?.length === 0) {
				setFormDisabled(false);
			} else {
				setFormDisabled(true);
			}
		}
	}, [formValues]);

	const loginHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const newErrors: FormErrors[] = [];
		!formValues?.username && newErrors.push({ item: `username`, message: "وارد کردن شماره تماس الزامی است" });
		setFormErrors(newErrors);
		if (newErrors?.length === 0) {
			setFormDisabled(false);
			executeLogin();
		} else {
			setFormDisabled(true);
		}
	};

	const executeLogin = async () => {
		try {
			setLoginLoading(true);
			const res = await readData<Res<boolean>>(`${API_URL}v1/check-username`, formValues);
			if (res?.data) {
				router.push(`/auth/login?username=${formValues?.username}`);
			} else {
				executeSendOTP();
			}
		} catch (error: any) {
			console.warn(error);
			showNotification({
				type: "error",
				message: error?.message ?? "ورود با خطا مواجه شد",
			});
		} finally {
			setLoginLoading(false);
		}
	};

	const executeSendOTP = async () => {
		try {
			setLoginLoading(true);
			const res = await createData<CheckUsernameFormValues, Res<null>>(`${API_URL}v1/sign-up/otp/send`, formValues);
			if (res?.success) {
				router.push(`/auth/sign-up/otp?username=${formValues?.username}`);
			} else {
				showNotification({
					type: "error",
					message: res?.message ?? "ارسال کد تایید با خطا مواجه شد",
				});
			}
		} catch (error: any) {
			console.warn(error);
			showNotification({
				type: "error",
				message: error?.message ?? "ارسال کد تایید با خطا مواجه شد",
			});
		} finally {
			setLoginLoading(false);
		}
	};
	return (
		<div className="w-full lg:!p-6 lg:!border border-neutral-300 rounded-lg h-full max-lg:!h-screen flex items-center justify-center flex-col">
			<MobileTopHeader pageName="" hasBAck backUrl="/" backAction={router.back} />
			<form className="max-lg:!p-4 h-full flex justify-center flex-col max-lg:!-mt-16" onSubmit={loginHandler}>
				<div className="w-full flex justify-center relative">
					<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon" onClick={()=>router.back()}>
						<IconArrowLine className="rotate-180" height={28} width={28} />
					</TabanButton>
					<Image src="/images/logo.svg" width={48} height={48} alt="logo" />
				</div>
				<div className="font-semibold text-xl mt-8">ورود | ثبت نام</div>
				<div className="mt-2">به معماریاب خوش آمدید، برای ورود یا ایجاد حساب کاربری لطفا شماره تماس خود را وارد کنید</div>
				<div className="mt-6">
					<TabanInput
						isLtr
						disabled={loginLoading}
						value={formValues?.username}
						groupMode
						setValue={setFormValues}
						name="username"
						label="شماره تماس"
						isHandleError
						hasError={!!findError(formErrors, "username")}
						errorText={findError(formErrors, "username")?.message}
					/>
				</div>
				<div className="mt-10">
					<TabanButton
						isLoading={loginLoading}
						loadingText="در حال ورود"
						type="submit"
						className="w-full"
						disabled={formDisabled || loginLoading}
					>
						ورود
					</TabanButton>
					<div className="text-neutral-500 text-xs font-medium mt-4 text-center">
						ورود شما به معنای پذیرش قوانین مربوط به معماریاب می‌باشد
					</div>
				</div>
			</form>
		</div>
	);
}
