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
import MobileTopHeader from "@/app/_components/mobileTopHeader/mobileTopHeader";
import { useRouter } from "next/navigation";
import { CheckOTPFormValues } from "../../_types/checkOTPFormValues.type";
import { TimerRef } from "../../_components/timer/timer.types";
import { Timer } from "../../_components/timer/timer";
import Link from "next/link";
import { mobileRegex } from "@/utils/mobileRegex";
import { useApi } from "@/hooks/useApi";
import { AuthEndpoints } from "../../_api/endpoints";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";

export default function Page() {
	const router = useRouter();
	const timerRef = useRef<TimerRef>(null);
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<CheckOTPFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [showResendCode, setShowResendCode] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username", "backUrl"]);

	const {
		result: loginOTPResult,
		resultData: loginOTPResultData,
		fetchData: loginWithOTP,
		loading: loginOTPLoading,
	} = useApi(async (username: string, otp: string) => await AuthEndpoints.loginWithOTP(username, otp));

	const {
		result: sendOTPResult,
		fetchData: sendOTP,
		loading: sendOTPLoading,
	} = useApi(async (username: string) => await AuthEndpoints.sendLoginOTP(username));

	const getTwoMinutesFromNow = () => {
		const time = new Date();
		time.setSeconds(time.getSeconds() + 2);
		return time;
	};

	useEffect(() => {
		setFormValues((prev) => ({ ...prev, username: !!searchParams?.username ? searchParams?.username : undefined }));
	}, []);

	useEffect(() => {
		if (formSubmited) {
			formValidator();
		}
	}, [formValues]);

	const loginWithOTPHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const errors = formValidator();
		if (errors?.length === 0) {
			loginWithOTP(formValues?.username!, formValues?.otp!);
		}
	};

	useEffect(() => {
		if (loginOTPResult) {
			if (loginOTPResult?.success) {
				const now = new Date();
				const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
				storage.set(StorageKey?.TOKEN, `${loginOTPResultData?.data?.acceeToken}`);
				storage.set(StorageKey?.USERNAME, JSON.stringify(loginOTPResultData?.data?.username));
				storage.set(StorageKey?.EXPIRES_AT, JSON.stringify(tomorrow));
				if (searchParams?.backUrl) {
					window.location.href = searchParams?.backUrl;
				} else {
					window.location.href = "/";
				}
			} else {
				showNotification({
					type: "error",
					message: loginOTPResult?.description ?? "ورود با خطا مواجه شد",
				});
			}
		}
	}, [loginOTPResult]);

	useEffect(() => {
		if (sendOTPResult) {
			if (sendOTPResult?.success) {
				showNotification({
					type: "success",
					message: sendOTPResult?.data?.message,
				});
				setShowResendCode(false);
			} else {
				showNotification({
					type: "error",
					message: sendOTPResult?.description ?? "ارسال کد تایید با خطا مواجه شد",
				});
			}
		}
	}, [sendOTPResult]);

	const resendOTPHandler = () => {
		setFormValues((prev) => ({ ...prev, otp: "" }));
		sendOTP(formValues?.username!);
	};

	const formValidator = () => {
		const newErrors: FormErrors[] = [];
		!formValues?.username && newErrors.push({ item: `username`, message: "وارد کردن شماره تماس الزامی است" });
		formValues?.otp?.length !== 5 && newErrors.push({ item: `otp`, message: "کد تایید باید 5 رقمی باشد" });
		!formValues?.otp && newErrors.push({ item: `otp`, message: "وارد کردن کد تایید الزامی است" });
		formValues?.username &&
			!mobileRegex.test(formValues?.username) &&
			newErrors.push({ item: "username", message: "شماره موبایل وارد شده صحیح نیست" });
		setFormErrors(newErrors);

		newErrors?.length > 0 ? setFormDisabled(true) : setFormDisabled(false);
		return newErrors;
	};
	return (
		<div className="w-full lg:!p-6 lg:!border border-secondary rounded-2xl h-full bg-white">
			<MobileTopHeader pageName="" hasBAck backUrl="/auth/login" />
			<form className="max-lg:!p-4 h-full flex justify-center flex-col max-lg:!-mt-16" onSubmit={loginWithOTPHandler}>
				<div className="max-lg:!min-h-[calc(100dvh-76px)]">
					<div className="w-full flex justify-center relative">
						<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon" onClick={() => router.back()}>
							<IconArrowLine className="rotate-180" height={28} width={28} />
						</TabanButton>
						<Link href="/"><Image src="/images/logo2.svg" width={72} height={72} alt="logo" /></Link>
					</div>
					<div className="font-semibold text-xl mt-5 text-center peyda">ورود با رمز یکبار مصرف</div>
					<div className="mt-1 text-center text-sm">
						کد تایید برای شماره {searchParams?.username} ارسال شد، برای ورود آن را وارد کنید
					</div>
					<div className="mt-4">
						<TabanInput
							isLtr
							disabled={loginOTPLoading}
							value={formValues?.otp}
							groupMode
							setValue={setFormValues}
							name="otp"
							label="کد تایید"
							inputClassName="text-center !px-12"
							isHandleError
							hasError={!!findError(formErrors, "otp")}
							errorText={findError(formErrors, "otp")?.message}
						/>
					</div>
					<div className="mt-1 lg:!mt-10 flex lg:items-center max-lg:!flex-col w-full lg:justify-between ">
						<Link
							href={`/auth/login?username=${formValues?.username}`}
							className="text-sm font-medium flex justify-center  leading-4 py-2.5 px-3 cursor-pointer bg-white/0 max-lg:!justify-start  text-secondary"
						>
							ورود با رمز عبور
						</Link>
						{showResendCode ? (
							<button
								disabled={sendOTPLoading}
								type="button"
								className="text-sm font-medium flex justify-center  leading-4 py-2.5 px-3 cursor-pointer bg-white/0 max-lg:!justify-start text-primary"
								onClick={(e) => {
									e?.preventDefault();
									resendOTPHandler();
								}}
							>
								دریافت مجدد کد
							</button>
						) : (
							<div className="text-sm font-medium flex justify-center whitespace-nowrap leading-4 py-2.5 px-3 gap-1  max-lg:!justify-start text-primary/80">
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
				</div>
				<div className="mt-1 flex flex-col items-center gap-2 w-full">
					<TabanButton
						isLoading={loginOTPLoading}
						loadingText="در حال ورود"
						type="submit"
						className="!w-full"
						disabled={formDisabled || loginOTPLoading}
					>
						ورود به حساب
					</TabanButton>
				</div>
			</form>
		</div>
	);
}
