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

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<SetPasswordFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username", "backUrl"]);

	const {
		result: setPasswordResult,
		resultData: setPasswordResultData,
		fetchData: setPassword,
		loading: setPasswordLoading,
	} = useApi(async (username: string, password: string) => await AuthEndpoints.setPassword(username, password));

	useEffect(() => {
		setFormValues((prev) => ({ ...prev, username: !!searchParams?.username ? searchParams?.username : undefined }));
	}, []);

	useEffect(() => {
		if (formSubmited) {
			formValidator();
		}
	}, [formValues]);

	const setPasswordHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const errors = formValidator();
		if (errors?.length === 0) {
			setPassword(formValues?.username!, formValues?.password!);
		}
	};

	useEffect(() => {
		if (setPasswordResult) {
			if (setPasswordResult?.success) {
				const now = new Date();
				const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
				storage.set(StorageKey?.TOKEN, `${setPasswordResultData?.data?.acceeToken}`);
				storage.set(StorageKey?.USERNAME, JSON.stringify(setPasswordResultData?.data?.username));
				storage.set(StorageKey?.EXPIRES_AT, JSON.stringify(tomorrow));
				router.push(`/auth/sign-up/complete-profile?username=${formValues?.username}&backUrl=${searchParams?.backUrl ?? ""}`);
			} else {
				showNotification({
					type: "error",
					message: setPasswordResult?.description ?? "ورود با خطا مواجه شد",
				});
			}
		}
	}, [setPasswordResult]);

	const formValidator = () => {
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
			<form className="max-lg:!p-4 h-full flex flex-col max-lg:!-mt-16 w-full max-lg:!pb-4" onSubmit={setPasswordHandler}>
				<div className="max-lg:!min-h-[calc(100dvh-76px)]">
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
					<div className="font-semibold text-xl mt-5 text-center peyda">رمز عبور</div>
					<div className="mt-1">برای دسترسی به امکانات سایت، لطفا رمز عبور خود را وارد کنید</div>
					<div className="mt-4">
						<TabanInput
							isLtr
							isPasswordInput
							disabled={setPasswordLoading}
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
					<div className="mt-2">
						<TabanInput
							isLtr
							isPasswordInput
							disabled={setPasswordLoading}
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
				</div>
				<div className="mt-2 flex flex-col items-center gap-2 w-full">
					<TabanButton
						isLoading={setPasswordLoading}
						loadingText="در حال ورود"
						type="submit"
						className="!w-full"
						disabled={formDisabled || setPasswordLoading}
					>
						تکمیل پروفایل
					</TabanButton>
				</div>
			</form>
		</div>
	);
}
