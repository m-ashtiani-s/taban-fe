"use client";

import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { useNotificationStore } from "@/stores/notification.store";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";
import { FormErrors } from "@/types/formErrors.type";
import { findError } from "@/utils/formErrorsFinder";
import { mobileRegex } from "@/utils/mobileRegex";
import { passwordRegex } from "@/utils/passwordRegex";
import { AuthEndpoints } from "@/app/(withoutLayout)/auth/_api/endpoints";
import { Login } from "@/app/(withoutLayout)/auth/_types/login.type";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { Profile } from "@/types/profile.type";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconArrowLine, IconCircleUser } from "@/app/_components/icon/icons";
import { useProfiletore } from "@/stores/profile";

type AuthStep = "username" | "login" | "otp" | "password";
/**
 * مقصدِ مرحله‌های otp و password را مشخص می‌کند تا این دو مرحله بین سه فلو به اشتراک گذاشته شوند:
 * signup (ثبت‌نام)، login (ورود با رمز یکبارمصرف)، forgot (فراموشی رمز عبور).
 */
type OtpMode = "signup" | "login" | "forgot";

type AuthModalProps = {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	/** Called after a successful login/sign-up. The token is already stored. */
	onSuccess?: () => void;
	title?: string;
	description?: string;
};

const RESEND_SECONDS = 120;

export default function AuthModal({ open, setOpen, onSuccess, title, description }: AuthModalProps) {
	const [step, setStep] = useState<AuthStep>("username");
	const [otpMode, setOtpMode] = useState<OtpMode>("signup");
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [otp, setOtp] = useState<string>("");
	const [referralCode, setReferralCode] = useState<string>("");
	const [errors, setErrors] = useState<FormErrors[]>([]);
	const [resendIn, setResendIn] = useState<number>(0);

	const showNotification = useNotificationStore((state) => state.showNotification);
	const { profile, setProfile } = useProfiletore();

	const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);

	const resetAll = () => {
		setStep("username");
		setOtpMode("signup");
		setUsername("");
		setPassword("");
		setConfirmPassword("");
		setOtp("");
		setReferralCode("");
		setErrors([]);
		setResendIn(0);
		if (resendTimer.current) clearInterval(resendTimer.current);
	};

	const startResendCountdown = () => {
		setResendIn(RESEND_SECONDS);
		if (resendTimer.current) clearInterval(resendTimer.current);
		resendTimer.current = setInterval(() => {
			setResendIn((prev) => {
				if (prev <= 1) {
					if (resendTimer.current) clearInterval(resendTimer.current);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const getProfile = useMutation({
		mutationFn: () => withMappedError(() => TabanEndpoints.getProfile()),
	});

	const finalizeAuth = async (data?: Login | null) => {
		const now = new Date();
		const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
		storage.set(StorageKey.TOKEN, `${data?.acceeToken}`);
		storage.set(StorageKey.USERNAME, JSON.stringify(data?.username));
		storage.set(StorageKey.EXPIRES_AT, JSON.stringify(tomorrow));

		try {
			const profileData = await getProfile.mutateAsync();
			setProfile((profileData?.data as Profile) ?? null);
		} catch {
		}

		// کد معرف (در صورت وجود) مصرف شد
		storage.remove(StorageKey.REFERRAL_CODE);

		showNotification({ type: "success", message: "خوش آمدید!" });
		setOpen(false);
		onSuccess?.();
		resetAll();
	};

	const sendOtp = useMutation({
		mutationFn: (u: string) => withMappedError(() => AuthEndpoints.sendOTP(u)),
		meta: { showNotification: true },
		onSuccess: () => {
			setErrors([]);
			setOtp("");
			setStep("otp");
			startResendCountdown();
		},
	});

	const checkUsername = useMutation({
		mutationFn: (u: string) => withMappedError(() => AuthEndpoints.checkUsername(u)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			if (data?.data) {
				setErrors([]);
				setStep("login");
			} else {
				setOtpMode("signup");
				sendOtp.mutate(username);
			}
		},
	});

	const login = useMutation({
		mutationFn: (vars: { u: string; p: string }) => withMappedError(() => AuthEndpoints.login(vars.u, vars.p)),
		meta: { showNotification: true },
		onSuccess: (data) => finalizeAuth(data?.data),
	});

	const sendLoginOtp = useMutation({
		mutationFn: (u: string) => withMappedError(() => AuthEndpoints.sendLoginOTP(u)),
		meta: { showNotification: true },
		onSuccess: () => {
			setErrors([]);
			setOtp("");
			setStep("otp");
			startResendCountdown();
		},
	});

	const loginWithOtp = useMutation({
		mutationFn: (vars: { u: string; code: string }) => withMappedError(() => AuthEndpoints.loginWithOTP(vars.u, vars.code)),
		meta: { showNotification: true },
		onSuccess: (data) => finalizeAuth(data?.data),
	});

	const sendForgetOtp = useMutation({
		mutationFn: (u: string) => withMappedError(() => AuthEndpoints.sendForgetPasswordOTP(u)),
		meta: { showNotification: true },
		onSuccess: () => {
			setErrors([]);
			setOtp("");
			setStep("otp");
			startResendCountdown();
		},
	});

	const checkOtp = useMutation({
		mutationFn: (vars: { u: string; code: string }) => withMappedError(() => AuthEndpoints.checkOTP(vars.u, vars.code)),
		meta: { showNotification: true },
		onSuccess: () => {
			setErrors([]);
			setStep("password");
		},
	});

	const checkForgetOtp = useMutation({
		mutationFn: (vars: { u: string; code: string }) => withMappedError(() => AuthEndpoints.checkForgetPasswordOTP(vars.u, vars.code)),
		meta: { showNotification: true },
		onSuccess: () => {
			setErrors([]);
			setStep("password");
		},
	});

	const setPasswordApi = useMutation({
		mutationFn: (vars: { u: string; p: string; ref?: string }) =>
			withMappedError(() => AuthEndpoints.setPassword(vars.u, vars.p, vars.ref)),
		meta: { showNotification: true },
		onSuccess: (data) => finalizeAuth(data?.data),
	});

	const changePasswordApi = useMutation({
		mutationFn: (vars: { u: string; p: string }) => withMappedError(() => AuthEndpoints.changePassword(vars.u, vars.p)),
		meta: { showNotification: true },
		onSuccess: () => {
			showNotification({ type: "success", message: "رمز عبور با موفقیت تغییر کرد، اکنون وارد شوید" });
			setPassword("");
			setConfirmPassword("");
			setOtp("");
			setErrors([]);
			setStep("login");
		},
	});

	useEffect(() => {
		if (!open) {
			resetAll();
		} else {
			const storedReferral = typeof window !== "undefined" ? storage.get(StorageKey.REFERRAL_CODE) : null;
			if (storedReferral) setReferralCode(storedReferral);
		}
		return () => {
			if (resendTimer.current) clearInterval(resendTimer.current);
		};
	}, [open]);

	/* ---------- username step ---------- */
	const submitUsername = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!username) errs.push({ item: "username", message: "وارد کردن شماره موبایل الزامی است" });
		else if (!mobileRegex.test(username)) errs.push({ item: "username", message: "شماره موبایل وارد شده صحیح نیست" });
		setErrors(errs);
		if (errs.length > 0) return;
		checkUsername.mutate(username);
	};

	/* ---------- login step ---------- */
	const submitLogin = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!password) errs.push({ item: "password", message: "وارد کردن رمز عبور الزامی است" });
		setErrors(errs);
		if (errs.length > 0) return;
		login.mutate({ u: username, p: password });
	};

	// ورود با رمز یکبارمصرف: شماره در مرحله‌ی قبل اعتبارسنجی شده، پس فقط کد ارسال می‌شود
	const startLoginWithOtp = () => {
		if (!username) return;
		setErrors([]);
		setOtpMode("login");
		sendLoginOtp.mutate(username);
	};

	// فراموشی رمز عبور: ارسال کد تایید برای بازیابی رمز
	const startForgotPassword = () => {
		if (!username) return;
		setErrors([]);
		setOtpMode("forgot");
		sendForgetOtp.mutate(username);
	};

	/* ---------- otp step (shared between signup / login / forgot) ---------- */
	const submitOtp = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!otp) errs.push({ item: "otp", message: "وارد کردن کد تایید الزامی است" });
		else if (otp.length !== 5) errs.push({ item: "otp", message: "کد تایید باید ۵ رقمی باشد" });
		setErrors(errs);
		if (errs.length > 0) return;
		if (otpMode === "login") loginWithOtp.mutate({ u: username, code: otp });
		else if (otpMode === "forgot") checkForgetOtp.mutate({ u: username, code: otp });
		else checkOtp.mutate({ u: username, code: otp });
	};

	const resendHandler = () => {
		if (resendIn > 0) return;
		setOtp("");
		if (otpMode === "login") sendLoginOtp.mutate(username);
		else if (otpMode === "forgot") sendForgetOtp.mutate(username);
		else sendOtp.mutate(username);
	};

	/* ---------- password step (set-password for signup / change-password for forgot) ---------- */
	const submitPassword = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!password) errs.push({ item: "password", message: "وارد کردن رمز عبور الزامی است" });
		else if (!passwordRegex.test(password)) errs.push({ item: "password", message: "رمز عبور باید حداقل ۶ کاراکتر و شامل یک حرف و یک عدد باشد" });
		if (!confirmPassword) errs.push({ item: "confirmPassword", message: "وارد کردن تکرار رمز عبور الزامی است" });
		else if (password && password !== confirmPassword) errs.push({ item: "confirmPassword", message: "رمز عبور و تکرار آن مطابقت ندارد" });
		setErrors(errs);
		if (errs.length > 0) return;
		if (otpMode === "forgot") changePasswordApi.mutate({ u: username, p: password });
		else setPasswordApi.mutate({ u: username, p: password, ref: referralCode.trim() || undefined });
	};

	const usernameLoading = checkUsername.isPending || sendOtp.isPending;
	const otpChecking = otpMode === "login" ? loginWithOtp.isPending : otpMode === "forgot" ? checkForgetOtp.isPending : checkOtp.isPending;
	const otpResending = otpMode === "login" ? sendLoginOtp.isPending : otpMode === "forgot" ? sendForgetOtp.isPending : sendOtp.isPending;
	const passwordSubmitting = otpMode === "forgot" ? changePasswordApi.isPending : setPasswordApi.isPending || getProfile.isPending;
	const stepTitle =
		step === "username"
			? "ورود | ثبت نام"
			: step === "login"
				? "ورود"
				: step === "otp"
					? otpMode === "forgot"
						? "بازیابی رمز عبور"
						: otpMode === "login"
							? "ورود با رمز یکبار مصرف"
							: "کد تایید"
					: otpMode === "forgot"
						? "رمز عبور جدید"
						: "تعیین رمز عبور";

	const goBackToUsername = () => {
		setErrors([]);
		setPassword("");
		setOtp("");
		setStep("username");
	};

	const goBackToLogin = () => {
		setErrors([]);
		setOtp("");
		setStep("login");
	};

	return (
		<TabanModal open={open} setOpen={setOpen} title={title ?? "ورود به حساب کاربری"} onClose={() => setOpen(false)}>
			<div className="flex flex-col items-center gap-1 pb-2">
				<Image src="/images/logo2.svg" width={56} height={56} alt="logo" />
				<div className="peyda font-bold text-lg text-primary mt-2">{stepTitle}</div>
				{description && step === "username" && (
					<div className="text-xs text-neutral-500 text-center leading-6 max-w-xs">{description}</div>
				)}
			</div>

			{/* username step */}
			{step === "username" && (
				<form className="flex flex-col gap-4 pt-2" onSubmit={submitUsername}>
					<div className="text-sm text-center text-neutral-500">برای ادامه، شماره موبایل خود را وارد کنید</div>
					<TabanInput
						isLtr
						disabled={usernameLoading}
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						name="username"
						leadingIcon={<IconCircleUser />}
						label="شماره همراه"
						isHandleError
						hasError={!!findError(errors, "username")}
						errorText={findError(errors, "username")?.message}
					/>
					<TabanButton
						type="submit"
						className="!w-full justify-center"
						isLoading={usernameLoading}
						loadingText="در حال بررسی"
						disabled={usernameLoading}
					>
						ادامه
					</TabanButton>
				</form>
			)}

			{/* login step */}
			{step === "login" && (
				<form className="flex flex-col gap-4 pt-2" onSubmit={submitLogin}>
					<div className="text-sm text-center text-neutral-500">
						خوش آمدید، رمز عبور حساب{" "}
						<span className="font-medium" dir="ltr">
							{username}
						</span>{" "}
						را وارد کنید
					</div>
					<TabanInput
						isLtr
						isPasswordInput
						disabled={login.isPending}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						name="password"
						label="رمز عبور"
						isHandleError
						hasError={!!findError(errors, "password")}
						errorText={findError(errors, "password")?.message}
					/>
					<button
						type="button"
						onClick={startForgotPassword}
						disabled={sendForgetOtp.isPending}
						className="text-xs text-secondary self-start flex items-center gap-1 hover:gap-1.5 duration-150 disabled:opacity-60"
					>
						{sendForgetOtp.isPending ? "در حال ارسال کد..." : "فراموشی رمز عبور"}
						<IconArrowLine width={14} height={14} />
					</button>
					<TabanButton
						type="submit"
						className="!w-full justify-center"
						isLoading={login.isPending || getProfile.isPending}
						loadingText="در حال ورود"
						disabled={login.isPending || getProfile.isPending}
					>
						ورود به حساب
					</TabanButton>
					<TabanButton
						variant="bordered"
						type="button"
						onClick={startLoginWithOtp}
						isLoading={sendLoginOtp.isPending}
						loadingText="در حال ارسال کد..."
						className="!w-full justify-center"
						disabled={sendLoginOtp.isPending}
					>
						ورود با رمز یکبار مصرف
					</TabanButton>
					<button
						type="button"
						onClick={goBackToUsername}
						className="text-xs text-secondary flex items-center justify-center gap-1 hover:gap-1.5 duration-150"
					>
						<IconArrowLine className="rotate-180" width={16} height={16} />
						اصلاح شماره همراه
					</button>
				</form>
			)}

			{/* otp step */}
			{step === "otp" && (
				<form className="flex flex-col gap-4 pt-2" onSubmit={submitOtp}>
					<div className="text-sm text-center text-neutral-500 leading-6">
						{otpMode === "signup" ? (
							<>
								حسابی با شماره <span dir="ltr">{username}</span> یافت نشد. کد تایید برای ساخت حساب ارسال شد.
							</>
						) : otpMode === "forgot" ? (
							<>
								کد تایید برای شماره <span dir="ltr">{username}</span> ارسال شد، برای تغییر رمز عبور آن را وارد کنید
							</>
						) : (
							<>
								کد تایید برای شماره <span dir="ltr">{username}</span> ارسال شد، برای ورود آن را وارد کنید
							</>
						)}
					</div>
					<TabanInput
						isLtr
						disabled={otpChecking}
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						name="otp"
						label="کد تایید"
						inputClassName="text-center !px-12"
						isHandleError
						hasError={!!findError(errors, "otp")}
						errorText={findError(errors, "otp")?.message}
					/>
					<div className="flex items-center justify-between text-xs">
						<button
							type="button"
							onClick={otpMode === "signup" ? goBackToUsername : goBackToLogin}
							className="text-secondary"
						>
							{otpMode === "signup" ? "اصلاح شماره همراه" : "ورود با رمز عبور"}
						</button>
						{resendIn > 0 ? (
							<span className="text-neutral-400">ارسال مجدد تا {resendIn} ثانیه دیگر</span>
						) : (
							<button
								type="button"
								onClick={resendHandler}
								disabled={otpResending}
								className="text-primary font-medium"
							>
								دریافت مجدد کد
							</button>
						)}
					</div>
					<TabanButton
						type="submit"
						className="!w-full justify-center"
						isLoading={otpChecking || getProfile.isPending}
						loadingText={otpMode === "login" ? "در حال ورود" : "در حال بررسی"}
						disabled={otpChecking || getProfile.isPending}
					>
						{otpMode === "login" ? "ورود به حساب" : "ادامه"}
					</TabanButton>
				</form>
			)}

			{/* password step */}
			{step === "password" && (
				<form className="flex flex-col gap-4 pt-2" onSubmit={submitPassword}>
					<div className="text-sm text-center text-neutral-500">
						{otpMode === "forgot" ? "رمز عبور جدید خود را وارد کنید" : "یک رمز عبور برای حساب خود تعیین کنید"}
					</div>
					<TabanInput
						isLtr
						isPasswordInput
						disabled={passwordSubmitting}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						name="password"
						label={otpMode === "forgot" ? "رمز عبور جدید" : "رمز عبور"}
						isHandleError
						hasError={!!findError(errors, "password")}
						errorText={findError(errors, "password")?.message}
					/>
					<TabanInput
						isLtr
						isPasswordInput
						disabled={passwordSubmitting}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						name="confirmPassword"
						label="تکرار رمز عبور"
						isHandleError
						hasError={!!findError(errors, "confirmPassword")}
						errorText={findError(errors, "confirmPassword")?.message}
					/>
					{otpMode !== "forgot" && (
						<TabanInput
							isLtr
							disabled={passwordSubmitting}
							value={referralCode}
							onChange={(e) => setReferralCode(e.target.value)}
							name="referralCode"
							label="کد معرف (اختیاری)"
						/>
					)}
					<TabanButton
						type="submit"
						className="!w-full justify-center"
						isLoading={passwordSubmitting}
						loadingText={otpMode === "forgot" ? "در حال ثبت" : "در حال ساخت حساب"}
						disabled={passwordSubmitting}
					>
						{otpMode === "forgot" ? "تغییر رمز عبور" : "ساخت حساب و ورود"}
					</TabanButton>
				</form>
			)}
		</TabanModal>
	);
}
