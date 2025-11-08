"use client";

import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconArrowLine } from "@/app/_components/icon/icons";
import useReadSearchParams from "@/hooks/useReadSearchParams";
import { useNotificationStore } from "@/stores/notification.store";
import { FormErrors } from "@/types/formErrors.type";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { findError } from "@/utils/formErrorsFinder";
import { createData, readData } from "@/core/http-service/http-service";
import { API_URL } from "@/config/global";
import { Res } from "@/types/responseType";
import MobileTopHeader from "@/app/_components/mobileTopHeader/mobileTopHeader";
import { useRouter } from "next/navigation";
import { CheckUsernameFormValues } from "../../_types/checkUsernameFormValues.type";
import { CheckOTPFormValues } from "../../_types/checkOTPFormValues.type";
import { TimerRef } from "../../_components/timer/timer.types";
import { Timer } from "../../_components/timer/timer";

export default function Page() {
	const router = useRouter();
	const timerRef = useRef<TimerRef>(null);
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<CheckOTPFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [showResendCode, setShowResendCode] = useState<boolean>(false);
	const [resendOTPLoading, setResendOTPLoading] = useState<boolean>(false);
	const [loginLoading, setLoginLoading] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username","backUrl"]);

	const getTwoMinutesFromNow = () => {
		const time = new Date();
		time.setSeconds(time.getSeconds() + 120);
		return time;
	};

	useEffect(() => {
		setFormValues((prev) => ({ ...prev, username: !!searchParams?.username ? searchParams?.username : undefined }));
	}, []);

	useEffect(() => {
		if (formSubmited) {
			const newErrors: FormErrors[] = [];
			!formValues?.username && newErrors.push({ item: `username`, message: "وارد کردن شماره تماس الزامی است" });
			formValues?.otp?.length !== 5 && newErrors.push({ item: `otp`, message: "کد تایید باید 5 رقمی باشد" });
			!formValues?.otp && newErrors.push({ item: `otp`, message: "وارد کردن کد تایید الزامی است" });
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
		formValues?.otp?.length !== 5 && newErrors.push({ item: `otp`, message: "کد تایید باید 5 رقمی باشد" });
		!formValues?.otp && newErrors.push({ item: `otp`, message: "وارد کردن کد تایید الزامی است" });
		setFormErrors(newErrors);
		if (newErrors?.length === 0) {
			setFormDisabled(false);
			executeCheckOTPLogin();
		} else {
			setFormDisabled(true);
		}
	};

	const executeSendOTP = async () => {
		try {
			setFormValues((prev) => ({ ...prev, otp: "" }));
			setResendOTPLoading(true);
			const res = await createData<CheckUsernameFormValues, Res<null>>(`${API_URL}v1/sign-up/otp/send`, {username:formValues?.username});
			if (res?.success) {
				showNotification({
					type: "success",
					message: res?.message,
				});
				setShowResendCode(false)
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
			setResendOTPLoading(false);
		}
	};

	const executeCheckOTPLogin = async () => {
		try {
			setLoginLoading(true);
			const res = await createData<CheckUsernameFormValues,Res<boolean>>(`${API_URL}v1/sign-up/otp/check`, formValues);
			if (res?.data) {
				router.push(`/auth/sign-up/set-password?username=${formValues?.username}&backUrl=${searchParams?.backUrl??""}`);
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
	return (
		<div className="w-full lg:!p-4 lg:!border border-neutral-300 rounded-lg h-full max-lg:!h-screen flex items-center justify-center flex-col">
			<MobileTopHeader pageName="" hasBAck backUrl="/auth" />
			<form className="max-lg:!p-4 h-full flex justify-center flex-col max-lg:!-mt-16" onSubmit={loginHandler}>
				<div className="w-full flex justify-center relative">
					<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon"  isLink href="/auth">
						<IconArrowLine className="rotate-180" height={28} width={28} />
					</TabanButton>
					<Image src="/images/logo.svg" width={48} height={48} alt="logo" />
				</div>
				<div className="font-semibold text-xl mt-8">کد تایید را وارد کنید</div>
				<div className="mt-2">
					حساب کاربری ای با شماره {searchParams?.username} یافت نشد، کد تایید به جهت ساخت حساب، برای شماره شما ارسال شد
				</div>
				<div className="mt-6">
					<TabanInput
						isLtr
						disabled={loginLoading}
						value={formValues?.otp}
						groupMode
						setValue={setFormValues}
						name="otp"
						label="کد تایید"
						inputClassName="text-center px-12"
						isHandleError
						hasError={!!findError(formErrors, "otp")}
						errorText={findError(formErrors, "otp")?.message}
					/>
				</div>
				<div className="mt-10">
					{showResendCode ? (
						<button
							disabled={resendOTPLoading}
							className="text-sm mx-auto font-medium flex justify-center  leading-4 py-2.5 px-3 cursor-pointer bg-white/0"
							onClick={(e) => {
								e?.preventDefault();
								executeSendOTP();
							}}
						>
							دریافت مجدد کد
						</button>
					) : (
						<div className="text-sm font-medium flex justify-center whitespace-nowrap leading-4 py-2.5 px-3 gap-1 text-primary">
							<Timer
								ref={timerRef}
								className=""
								size="tiny"
								onExpire={() => {
									setShowResendCode(true);
								}}
								expiryTimestamp={getTwoMinutesFromNow()}
								showDays={false}
								showHours={false}
							/>
							تا ارسال مجدد
						</div>
					)}
				</div>
				<div className="mt-2">
					<TabanButton
						isLoading={loginLoading}
						loadingText="در حال ورود"
						type="submit"
						className="w-full"
						disabled={formDisabled || loginLoading}
					>
						ادامه
					</TabanButton>
				</div>
			</form>
		</div>
	);
}
