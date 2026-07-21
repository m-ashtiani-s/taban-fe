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
import { useMutation } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { AuthEndpoints } from "../../_api/endpoints";

export default function Page() {
	const [formValues, setFormValues] = useState<CheckOTPFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [showResendCode, setShowResendCode] = useState<boolean>(false);

	const showNotification = useNotificationStore((state) => state.showNotification);

	const router = useRouter();
	const timerRef = useRef<TimerRef>(null);
	const searchParams = useReadSearchParams(["username", "backUrl"]);

	const checkOTPMutation = useMutation({
		mutationFn: (vars: { username: string; otp: string }) =>
			withMappedError(() => AuthEndpoints.checkOTP(vars.username, vars.otp)),
		meta: { showNotification: true },
		onSuccess: () => {
			router.push(`/auth/sign-up/set-password?username=${formValues?.username}&backUrl=${searchParams?.backUrl ?? ""}`);
		},
	});

	const sendOTPMutation = useMutation({
		mutationFn: (username: string) => withMappedError(() => AuthEndpoints.sendOTP(username)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			showNotification({
				type: "success",
				message: data?.message,
			});
			setShowResendCode(false);
		},
	});

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
			formValidator();
		}
	}, [formValues]);

	const checkOTPHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const errors = formValidator();
		if (errors?.length === 0) {
			checkOTPMutation.mutate({ username: formValues?.username!, otp: formValues?.otp! });
		}
	};

	const resendOTPHandler = () => {
		setFormValues((prev) => ({ ...prev, otp: "" }));
		sendOTPMutation.mutate(formValues?.username!);
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
			<MobileTopHeader pageName="" hasBAck backUrl="/auth" />
			<form className="max-lg:!p-4 h-full flex justify-center flex-col max-lg:!-mt-16" onSubmit={checkOTPHandler}>
				<div className="max-lg:!min-h-[calc(100dvh-76px)]">
					<div className="w-full flex justify-center relative">
						<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon" onClick={() => router.back()}>
							<IconArrowLine className="rotate-180" height={28} width={28} />
						</TabanButton>
						<Link href="/"><Image src="/images/logo2.svg" width={72} height={72} alt="logo" /></Link>
					</div>
					<div className="font-semibold text-xl mt-5 text-center peyda">کد تایید</div>
					<div className="mt-1 text-center text-sm">
						حساب کاربری ای با شماره {searchParams?.username} یافت نشد، کد تایید به جهت ساخت حساب، برای شماره شما ارسال شد
					</div>
					<div className="mt-4">
						<TabanInput
							isLtr
							disabled={checkOTPMutation.isPending}
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
							href={`/auth?username=${formValues?.username}`}
							className="text-sm font-medium flex justify-center  leading-4 py-2.5 px-3 cursor-pointer bg-white/0 max-lg:!justify-start  text-secondary"
						>
							اصلاح شماره همراه
						</Link>
						{showResendCode ? (
							<button
								disabled={sendOTPMutation.isPending}
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
						isLoading={checkOTPMutation.isPending}
						loadingText="در حال ورود"
						type="submit"
						className="!w-full"
						disabled={formDisabled || checkOTPMutation.isPending}
					>
						ادامه
					</TabanButton>
				</div>
			</form>
		</div>
	);
}
