"use client";

import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconArrowLine, IconCircleUser } from "@/app/_components/icon/icons";
import useReadSearchParams from "@/hooks/useReadSearchParams";
import { useNotificationStore } from "@/stores/notification.store";
import { FormErrors } from "@/types/formErrors.type";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { findError } from "@/utils/formErrorsFinder";
import MobileTopHeader from "@/app/_components/mobileTopHeader/mobileTopHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { AuthEndpoints } from "./_api/endpoints";
import { CheckUsernameFormValues } from "./_types/checkUsernameFormValues.type";
import { mobileRegex } from "@/utils/mobileRegex";

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<CheckUsernameFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username","backUrl"]);

	const {
		result: checkUsernameResult,
		resultData: checkUsernameResultData,
		fetchData: executeCheckUsername,
		loading: checkUsernameLoading,
	} = useApi(async (username: string) => await AuthEndpoints.checkUsername(username));

	const {
		result: sendOTPResult,
		fetchData: sendOTP,
		loading: sendOTPLoading,
	} = useApi(async (username: string) => await AuthEndpoints.sendOTP(username));

	useEffect(() => {
		setFormValues({ username: searchParams?.username ?? "" });
	}, []);

	useEffect(() => {
		if (formSubmited) {
			formValidator();
		}
	}, [formValues]);

	const checkUsernameHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const errors = formValidator();
		if (errors?.length === 0) {
			executeCheckUsername(formValues?.username!);
		}
	};

	useEffect(() => {
		if (checkUsernameResult) {
			if (checkUsernameResult?.success) {
				if (checkUsernameResultData?.data) {
					router.push(`/auth/login?username=${formValues?.username}&backUrl=${searchParams?.backUrl ?? ""}`);
				} else {
					sendOTP(formValues?.username!);
				}
			} else {
				showNotification({
					type: "error",
					message: checkUsernameResult?.description ?? "ورود با خطا مواجه شد",
				});
			}
		}
	}, [checkUsernameResult]);

	useEffect(() => {
		if (sendOTPResult) {
			if (sendOTPResult?.success) {
				router.push(`/auth/sign-up/otp?username=${formValues?.username}&backUrl=${searchParams?.backUrl ?? ""}`);
			} else {
				showNotification({
					type: "error",
					message: sendOTPResult?.description ?? "ارسال کد تایید با خطا مواجه شد",
				});
			}
		}
	}, [sendOTPResult]);

	const formValidator = () => {
		const newErrors: FormErrors[] = [];
		!formValues?.username && newErrors.push({ item: "username", message: "وارد کردن شماره موبایل الزامی است" });
		formValues?.username && !mobileRegex.test(formValues?.username) && newErrors.push({ item: "username", message: "شماره موبایل وارد شده صحیح نیست" });
		setFormErrors(newErrors);

		newErrors?.length > 0 ? setFormDisabled(true) : setFormDisabled(false);
		return newErrors;
	};

	return (
		<div className="w-full lg:!p-6 lg:!border border-secondary rounded-2xl h-full max-lg:!h-screen flex items-center justify-center flex-col bg-white">
			<MobileTopHeader pageName="" hasBAck backUrl="/" backAction={router.back} />
			<form className="max-lg:!p-4 h-full flex justify-center flex-col max-lg:!-mt-16 !w-full" onSubmit={checkUsernameHandler}>
				<div className="w-full flex justify-center relative">
					<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon" onClick={() => router.back()}>
						<IconArrowLine className="rotate-180" height={28} width={28} />
					</TabanButton>
					<Link href="/"><Image src="/images/logo.svg" width={72} height={72} alt="logo" /></Link>
				</div>
				<div className="font-semibold text-xl mt-4 text-center peyda">ورود | ثبت نام</div>
				<div className="mt-6">
					<TabanInput
						isLtr
						disabled={sendOTPLoading || checkUsernameLoading}
						value={formValues?.username}
						groupMode
						setValue={setFormValues}
						name="username"
						leadingIcon={<IconCircleUser />}
						label="شماره همراه"
						isHandleError
						hasError={!!findError(formErrors, "username")}
						errorText={findError(formErrors, "username")?.message}
					/>
				</div>
				<div className="mt-1 w-full">
					<TabanButton
						isLoading={sendOTPLoading || checkUsernameLoading}
						loadingText="در حال ورود"
						type="submit"
						className="!w-full"
						disabled={formDisabled || sendOTPLoading || checkUsernameLoading}
					>
						ورود / ثبت نام
					</TabanButton>
					<div className="text-neutral-500 text-xs font-medium mt-8 text-center">
						با ورود و یا ثبت نام در رسمی‌یاب شما{" "}
						<Link href="/rules" className="text-primary font-semibold">
							شرایط و قوانین
						</Link>{" "}
						استفاده از سرویس‌های سایت رسمی‌یاب و قوانین حریم خصوصی آن را می‌پذیرید
					</div>
				</div>
			</form>
		</div>
	);
}
