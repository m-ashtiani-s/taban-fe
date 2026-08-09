"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { useProfile } from "@/hooks/useProfile";
import { useNotificationStore } from "@/stores/notification.store";
import { AuthEndpoints } from "@/app/(withoutLayout)/auth/_api/endpoints";
import { Timer } from "@/app/(withoutLayout)/auth/_components/timer/timer";
import { TimerRef } from "@/app/(withoutLayout)/auth/_components/timer/timer.types";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { IconArrowLine, IconLock } from "@/app/_components/icon/icons";
import { FormErrors } from "@/types/formErrors.type";
import { findError } from "@/utils/formErrorsFinder";
import { passwordRegex } from "@/utils/passwordRegex";

type ChangePasswordFormValues = {
	password?: string;
	confirmPassword?: string;
	otp?: string;
};

/** مرحله‌ی جاری: اول رمز جدید گرفته می‌شود، سپس با کد تایید نهایی می‌شود */
type Step = "password" | "otp";

export default function Page() {
	const router = useRouter();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const { profile, isLoading: profileLoading } = useProfile();

	const [step, setStep] = useState<Step>("password");
	const [formValues, setFormValues] = useState<ChangePasswordFormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [showResendCode, setShowResendCode] = useState<boolean>(false);

	const timerRef = useRef<TimerRef>(null);
	const username = profile?.phoneNumber || profile?.username || "";

	const sendOTPMutation = useMutation({
		mutationFn: () => withMappedError(() => AuthEndpoints.sendForgetPasswordOTP(username)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			showNotification({ type: "success", message: data?.message ?? "کد تایید ارسال شد" });
			setFormValues((prev) => ({ ...prev, otp: "" }));
			setFormErrors([]);
			setFormSubmited(false);
			setShowResendCode(false);
			setStep("otp");
		},
		onError: () => {
			// اگر ارسال کد شکست خورد و کاربر در مرحله‌ی کد است، اجازه‌ی تلاش مجدد می‌دهیم
			if (step === "otp") setShowResendCode(true);
		},
	});

	// کد تایید بررسی و بلافاصله رمز عبور جدید ثبت می‌شود؛ بک‌اند فقط پس از تاییدِ کد اجازه‌ی تغییر رمز می‌دهد
	const confirmMutation = useMutation({
		mutationFn: async (vars: { otp: string; password: string }) => {
			await withMappedError(() => AuthEndpoints.checkForgetPasswordOTP(username, vars.otp));
			return withMappedError(() => AuthEndpoints.changePassword(username, vars.password));
		},
		meta: { showNotification: true },
		onSuccess: () => {
			showNotification({ type: "success", message: "رمز عبور شما با موفقیت تغییر کرد" });
			router.push("/profile/info");
		},
	});

	const getTwoMinutesFromNow = () => {
		const time = new Date();
		time.setSeconds(time.getSeconds() + 120);
		return time;
	};

	const passwordValidator = () => {
		const newErrors: FormErrors[] = [];
		!formValues?.password && newErrors.push({ item: "password", message: "وارد کردن رمز عبور الزامی است" });
		!!formValues?.password &&
			!passwordRegex.test(formValues?.password) &&
			newErrors.push({ item: "password", message: "رمز عبور باید 6 رقمی و شامل یک حرف و یک عدد باشد" });
		!formValues?.confirmPassword && newErrors.push({ item: "confirmPassword", message: "وارد کردن تکرار رمز عبور الزامی است" });
		formValues?.confirmPassword &&
			formValues?.password &&
			formValues?.password !== formValues?.confirmPassword &&
			newErrors.push({ item: "confirmPassword", message: "رمز عبور و تکرار آن مطابقت ندارد" });
		setFormErrors(newErrors);
		return newErrors;
	};

	const otpValidator = () => {
		const newErrors: FormErrors[] = [];
		!formValues?.otp && newErrors.push({ item: "otp", message: "وارد کردن کد تایید الزامی است" });
		formValues?.otp && formValues?.otp?.length !== 5 && newErrors.push({ item: "otp", message: "کد تایید باید 5 رقمی باشد" });
		setFormErrors(newErrors);
		return newErrors;
	};

	const passwordHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const errors = passwordValidator();
		if (errors?.length === 0) {
			sendOTPMutation.mutate();
		}
	};

	const otpHandler = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setFormSubmited(true);
		const errors = otpValidator();
		if (errors?.length === 0) {
			confirmMutation.mutate({ otp: formValues?.otp!, password: formValues?.password! });
		}
	};

	const backToPasswordStep = () => {
		setStep("password");
		setFormValues((prev) => ({ ...prev, otp: "" }));
		setFormErrors([]);
		setFormSubmited(false);
	};

	const submitLoading = sendOTPMutation.isPending || confirmMutation.isPending;

	if (profileLoading && !profile) {
		return (
			<div className="flex items-center justify-center py-16 gap-2 text-sm text-neutral-500">
				<TabanLoading size={28} />
				در حال دریافت اطلاعات...
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-5">
			<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
				<div className="px-5 lg:px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
					<IconLock width={20} height={20} stroke="#1a3047" />
					<span className="text-sm font-semibold peyda">تغییر رمز عبور</span>
				</div>

				{step === "password" ? (
					<form className="p-5 lg:p-6 flex flex-col gap-4 max-w-md" onSubmit={passwordHandler}>
						<p className="text-xs leading-6 text-neutral-600">
							رمز عبور جدید خود را وارد کنید. برای تایید نهایی، یک کد تایید به شماره{" "}
							<span dir="ltr" className="font-medium text-neutral-800">
								{username}
							</span>{" "}
							ارسال می‌شود.
						</p>
						<TabanInput
							isLtr
							normalizeDigits
							isPasswordInput
							disabled={submitLoading}
							value={formValues?.password}
							groupMode
							setValue={setFormValues}
							name="password"
							label="رمز عبور جدید"
							isHandleError
							hasError={!!findError(formErrors, "password")}
							errorText={findError(formErrors, "password")?.message}
						/>
						<TabanInput
							isLtr
							normalizeDigits
							isPasswordInput
							disabled={submitLoading}
							value={formValues?.confirmPassword}
							groupMode
							setValue={setFormValues}
							name="confirmPassword"
							label="تکرار رمز عبور جدید"
							isHandleError
							hasError={!!findError(formErrors, "confirmPassword")}
							errorText={findError(formErrors, "confirmPassword")?.message}
						/>
						<div className="flex items-center gap-2">
							<TabanButton type="submit" isLoading={sendOTPMutation.isPending} loadingText="در حال ارسال کد" disabled={submitLoading}>
								دریافت کد تایید
							</TabanButton>
							<TabanButton variant="bordered" type="button" onClick={() => router.push("/profile/info")} disabled={submitLoading}>
								انصراف
							</TabanButton>
						</div>
					</form>
				) : (
					<form className="p-5 lg:p-6 flex flex-col gap-4 max-w-md" onSubmit={otpHandler}>
						<p className="text-xs leading-6 text-neutral-600">
							کد تایید به شماره{" "}
							<span dir="ltr" className="font-medium text-neutral-800">
								{username}
							</span>{" "}
							ارسال شد. برای ثبت رمز عبور جدید، آن را وارد کنید.
						</p>
						<TabanInput
							isLtr
							normalizeDigits
							disabled={submitLoading}
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
						<div className="flex items-center justify-between">
							<button
								type="button"
								onClick={backToPasswordStep}
								disabled={submitLoading}
								className="text-sm font-medium flex items-center gap-1 py-2.5 px-3 cursor-pointer text-secondary disabled:opacity-60"
							>
								<IconArrowLine className="rotate-180" width={18} height={18} />
								ویرایش رمز عبور
							</button>
							{showResendCode ? (
								<button
									type="button"
									disabled={sendOTPMutation.isPending}
									onClick={() => sendOTPMutation.mutate()}
									className="text-sm font-medium py-2.5 px-3 cursor-pointer text-primary disabled:opacity-60"
								>
									دریافت مجدد کد
								</button>
							) : (
								<div className="text-sm font-medium flex whitespace-nowrap leading-4 py-2.5 px-3 gap-1 text-primary/80">
									<Timer
										ref={timerRef}
										size="tiny"
										onExpire={() => setShowResendCode(true)}
										expiryTimestamp={getTwoMinutesFromNow()}
										showDays={false}
										showHours={false}
									/>
									تا ارسال مجدد
								</div>
							)}
						</div>
						<div>
							<TabanButton
								type="submit"
								isLoading={confirmMutation.isPending}
								loadingText="در حال ثبت"
								disabled={submitLoading}
							>
								تغییر رمز عبور
							</TabanButton>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
