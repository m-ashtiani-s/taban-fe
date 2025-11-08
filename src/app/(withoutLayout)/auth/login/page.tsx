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
import { createData, readData } from "@/core/http-service/http-service";
import { API_URL } from "@/config/global";
import { Res } from "@/types/responseType";
import { Login } from "../_types/login.type";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";
import MobileTopHeader from "@/app/_components/mobileTopHeader/mobileTopHeader";
import { useRouter } from "next/navigation";

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [formValues, setFormValues] = useState<LoginFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [loginLoading, setLoginLoading] = useState<boolean>(false);
	const searchParams = useReadSearchParams(["username", "backUrl"]);

	useEffect(() => {
		setFormValues((prev) => ({ ...prev, username: !!searchParams?.username ? searchParams?.username : undefined }));
	}, []);

	useEffect(() => {
		if (formSubmited) {
			const newErrors: FormErrors[] = [];
			!formValues?.password && newErrors.push({ item: `password`, message: "وارد کردن رمز عبورالزامی است" });
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
		!formValues?.password && newErrors.push({ item: `password`, message: "وارد کردن رمز عبور الزامی است" });
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
			const res = await createData<LoginFormValues, Res<Login>>(`${API_URL}v1/login`, formValues);
			storage.set(StorageKey?.TOKEN, `${res?.data?.acceeToken}`);
			storage.set(StorageKey?.USERNAME, JSON.stringify(res?.data?.username));
			if (searchParams?.backUrl) {
				window.location.href =searchParams?.backUrl;
			} else {
				window.location.href = "/";
			}
			// showNotification({
			// 	type: "success",
			// 	message: "ورود با موفقیت انجام شده، به صفحه خانه منتقل میشوید",
			// });
			// setTimeout(() => {
			// 	router.push("/");
			// }, 1000);
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
					<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon" isLink href="/auth">
						<IconArrowLine className="rotate-180" height={28} width={28} />
					</TabanButton>
					<Image src="/images/logo.svg" width={48} height={48} alt="logo" />
				</div>
				<div className="font-semibold text-xl mt-8">ورود به معماریاب</div>
				<div className="mt-1">به معماریاب خوش آمدید، برای ورود رمز عبور خود را وارد کنید</div>
				<div className="mt-6">
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
				<div className="mt-4 flex flex-col gap-2">
					<TabanButton
						isLoading={loginLoading}
						loadingText="در حال ورود"
						type="submit"
						className="w-full"
						disabled={formDisabled || loginLoading}
					>
						ورود به حساب
					</TabanButton>
					<TabanButton variant="text" isLink href="/register" className="w-full">
						فراموشی رمز عبور
					</TabanButton>
				</div>
			</form>
		</div>
	);
}
