"use client";

import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconArrowLine, IconCircleUser } from "@/app/_components/icon/icons";
import useReadSearchParams from "@/hooks/useReadSearchParams";
import { FormErrors } from "@/types/formErrors.type";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { findError } from "@/utils/formErrorsFinder";
import MobileTopHeader from "@/app/_components/mobileTopHeader/mobileTopHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { AuthEndpoints } from "./_api/endpoints";
import { CheckUsernameFormValues } from "./_types/checkUsernameFormValues.type";
import { mobileRegex } from "@/utils/mobileRegex";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";

export default function Page() {
	const [formValues, setFormValues] = useState<CheckUsernameFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);

	const router = useRouter();
	const searchParams = useReadSearchParams(["username", "backUrl", "ref"]);

	const sendOTPMutation = useMutation({
		mutationFn: (username: string) => withMappedError(() => AuthEndpoints.sendOTP(username)),
		meta: { showNotification: true },
		onSuccess: () => {
			router.push(`/auth/sign-up/otp?username=${formValues?.username}&backUrl=${searchParams?.backUrl ?? ""}`);
		},
	});

	const checkUsernameMutation = useMutation({
		mutationFn: (username: string) => withMappedError(() => AuthEndpoints.checkUsername(username)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			if (data?.data) {
				router.push(`/auth/login?username=${formValues?.username}&backUrl=${searchParams?.backUrl ?? ""}`);
			} else {
				sendOTPMutation.mutate(formValues?.username!);
			}
		},
	});

	const submitLoading = checkUsernameMutation.isPending || sendOTPMutation.isPending;

	useEffect(() => {
		setFormValues({ username: searchParams?.username ?? "" });
		// اگر کاربر با لینک معرف وارد شده (?ref=CODE)، کد را تا مرحله‌ی ثبت رمز عبور نگه می‌داریم
		if (searchParams?.ref) {
			storage.set(StorageKey.REFERRAL_CODE, searchParams.ref);
		}
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
			checkUsernameMutation.mutate(formValues?.username!);
		}
	};

	const formValidator = () => {
		const newErrors: FormErrors[] = [];
		!formValues?.username && newErrors.push({ item: "username", message: "وارد کردن شماره موبایل الزامی است" });
		formValues?.username && !mobileRegex.test(formValues?.username) && newErrors.push({ item: "username", message: "شماره موبایل وارد شده صحیح نیست" });
		setFormErrors(newErrors);

		newErrors?.length > 0 ? setFormDisabled(true) : setFormDisabled(false);
		return newErrors;
	};

	return (
		<div className="w-full lg:!p-6 lg:!border border-secondary rounded-2xl h-full max-lg:!h-[100dvh] flex items-center justify-center flex-col bg-white">
			<MobileTopHeader pageName="" hasBAck backUrl="/" backAction={router.back} />
			<form className="max-lg:!p-4 h-full flex justify-center flex-col max-lg:!-mt-16 !w-full" onSubmit={checkUsernameHandler}>
				<div className="w-full flex justify-center relative">
					<TabanButton className="absolute right-0 top-[8px] max-lg:!hidden" variant="icon" onClick={() => router.back()}>
						<IconArrowLine className="rotate-180" height={28} width={28} />
					</TabanButton>
					<Link href="/"><Image src="/images/logo2.svg" width={72} height={72} alt="logo" /></Link>
				</div>
				<div className="font-semibold text-xl mt-4 text-center peyda">ورود | ثبت نام</div>
				<div className="mt-6">
					<TabanInput
						isLtr
						disabled={submitLoading}
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
						isLoading={submitLoading}
						loadingText="در حال ورود"
						type="submit"
						className="!w-full"
						disabled={formDisabled || submitLoading}
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
