"use client";

import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconArrowLine } from "@/app/_components/icon/icons";
import useReadSearchParams from "@/hooks/useReadSearchParams";
import { useNotificationStore } from "@/stores/notification.store";
import { FormErrors } from "@/types/formErrors.type";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { LoginFormValues } from "../_types/LoginFormValues.type";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { findError } from "@/utils/formErrorsFinder";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";
import MobileTopHeader from "@/app/_components/mobileTopHeader/mobileTopHeader";
import { useRouter } from "next/navigation";
import { mobileRegex } from "@/utils/mobileRegex";
import { useApi } from "@/hooks/useApi";
import { AuthEndpoints } from "../_api/endpoints";
import Link from "next/link";

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<LoginFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username", "backUrl"]);

	const {
		result: loginResult,
		resultData: loginResultData,
		fetchData: executeLogin,
		loading: loginLoading,
	} = useApi(async (username: string, password: string) => await AuthEndpoints.login(username, password));

	useEffect(() => {
		setFormValues((prev) => ({ ...prev, username: !!searchParams?.username ? searchParams?.username : undefined }));
	}, []);

	useEffect(() => {
		if (formSubmited) {
			formValidator();
		}
	}, [formValues]);

	const loginHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const errors = formValidator();
		if (errors?.length === 0) {
			executeLogin(formValues?.username!, formValues?.password!);
		}
	};

	useEffect(() => {
		if (loginResult) {
			if (loginResult?.success) {
				const now = new Date();
				const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
				storage.set(StorageKey?.TOKEN, `${loginResultData?.data?.acceeToken}`);
				storage.set(StorageKey?.USERNAME, JSON.stringify(loginResultData?.data?.username));
				storage.set(StorageKey?.EXPIRES_AT, JSON.stringify(tomorrow));
				if (searchParams?.backUrl) {
					window.location.href = searchParams?.backUrl;
				} else {
					window.location.href = "/";
				}
			} else {
				showNotification({
					type: "error",
					message: loginResult?.description ?? "ورود با خطا مواجه شد",
				});
			}
		}
	}, [loginResult]);

	const formValidator = () => {
		const newErrors: FormErrors[] = [];
		!formValues?.password && newErrors.push({ item: `password`, message: "وارد کردن رمز عبور الزامی است" });
		!formValues?.username && newErrors.push({ item: "username", message: "وارد کردن شماره موبایل الزامی است" });
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
			<form className="max-lg:!p-4 h-full flex flex-col max-lg:!-mt-16 w-full max-lg:!pb-4" onSubmit={loginHandler}>
				<div className="max-lg:!min-h-[calc(100dvh-76px)]">
					<div className="w-full flex justify-center relative">
						<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon" onClick={() => router.back()}>
							<IconArrowLine className="rotate-180" height={28} width={28} />
						</TabanButton>
						<Link href="/"><Image src="/images/logo2.svg" width={72} height={72} alt="logo" /></Link>
					</div>
					<div className="font-semibold text-xl mt-5 text-center peyda">ورود</div>
					<div className="mt-1 text-center">به رسمی‌یاب خوش آمدید، برای ورود رمز عبور خود را وارد کنید</div>
					<div className="mt-4">
						<TabanInput
							isLtr
							disabled={loginLoading}
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
					{formValues?.username && (
						<Link
							href={`/auth/change-password/otp?username=${formValues?.username}`}
							className="lg:!hidden text-sm font-medium cursor-pointer leading-4 py-2.5 px-3 text-center w-fit text-[#4C8EB0] flex gap-1 items-center hover:gap-1.5 duration-200"
						>
							فراموشی رمز عبور
							<IconArrowLine />
						</Link>
					)}
				</div>
				<div className="mt-1 flex flex-col items-center gap-2 w-full">
					<TabanButton
						isLoading={loginLoading}
						loadingText="در حال ورود"
						type="submit"
						className="!w-full"
						disabled={formDisabled || loginLoading}
					>
						ورود به حساب
					</TabanButton>
					<TabanButton variant="text" isLink href="/register" className="!w-full max-lg:!hidden">
						فراموشی رمز عبور
					</TabanButton>
				</div>
			</form>
		</div>
	);
}
