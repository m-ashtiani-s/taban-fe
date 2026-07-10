"use client";

import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useApi } from "@/hooks/useApi";
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
	const showNotification = useNotificationStore((state) => state.showNotification);
	const { profile, setProfile } = useProfiletore();
	const [step, setStep] = useState<AuthStep>("username");
	const [otpMode, setOtpMode] = useState<OtpMode>("signup");
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [otp, setOtp] = useState<string>("");
	const [referralCode, setReferralCode] = useState<string>("");
	const [errors, setErrors] = useState<FormErrors[]>([]);
	const [resendIn, setResendIn] = useState<number>(0);
	const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);

	const checkUsername = useApi(async (u: string) => await AuthEndpoints.checkUsername(u));
	const sendOtp = useApi(async (u: string) => await AuthEndpoints.sendOTP(u));
	const login = useApi(async (u: string, p: string) => await AuthEndpoints.login(u, p));
	const checkOtp = useApi(async (u: string, code: string) => await AuthEndpoints.checkOTP(u, code));
	const setPasswordApi = useApi(
		async (u: string, p: string, ref?: string) => await AuthEndpoints.setPassword(u, p, ref)
	);
	const sendLoginOtp = useApi(async (u: string) => await AuthEndpoints.sendLoginOTP(u));
	const loginWithOtp = useApi(async (u: string, code: string) => await AuthEndpoints.loginWithOTP(u, code));
	const sendForgetOtp = useApi(async (u: string) => await AuthEndpoints.sendForgetPasswordOTP(u));
	const checkForgetOtp = useApi(async (u: string, code: string) => await AuthEndpoints.checkForgetPasswordOTP(u, code));
	const changePasswordApi = useApi(async (u: string, p: string) => await AuthEndpoints.changePassword(u, p));
	const getProfile = useApi(async () => await TabanEndpoints.getProfile());

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

	useEffect(() => {
		if (!open) {
			resetAll();
		} else {
			// اگر کاربر قبلاً با لینک معرف (?ref=) وارد شده، کد ذخیره‌شده را پیش‌پر می‌کنیم
			const storedReferral = typeof window !== "undefined" ? storage.get(StorageKey.REFERRAL_CODE) : null;
			if (storedReferral) setReferralCode(storedReferral);
		}
		return () => {
			if (resendTimer.current) clearInterval(resendTimer.current);
		};
	}, [open]);

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

	const finalizeAuth = async (data?: Login | null) => {
		const now = new Date();
		const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
		storage.set(StorageKey.TOKEN, `${data?.acceeToken}`);
		storage.set(StorageKey.USERNAME, JSON.stringify(data?.username));
		storage.set(StorageKey.EXPIRES_AT, JSON.stringify(tomorrow));

		// token is now stored — fetch the freshly logged-in user's profile and hydrate the store
		const profileRes = await getProfile.fetchDataResult();
		if (profileRes.success) {
			setProfile((profileRes.data?.data as Profile) ?? null);
		}

		// کد معرف (در صورت وجود) مصرف شد
		storage.remove(StorageKey.REFERRAL_CODE);

		showNotification({ type: "success", message: "خوش آمدید!" });
		setOpen(false);
		onSuccess?.();
		resetAll();
	};

	/* ---------- username step ---------- */
	const submitUsername = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!username) errs.push({ item: "username", message: "وارد کردن شماره موبایل الزامی است" });
		else if (!mobileRegex.test(username)) errs.push({ item: "username", message: "شماره موبایل وارد شده صحیح نیست" });
		setErrors(errs);
		if (errs.length > 0) return;
		checkUsername.fetchData(username);
	};

	useEffect(() => {
		if (!checkUsername.result) return;
		if (checkUsername.result.success) {
			if (checkUsername.result.data?.data) {
				setErrors([]);
				setStep("login");
			} else {
				setOtpMode("signup");
				sendOtp.fetchData(username);
			}
		} else {
			showNotification({ type: "error", message: checkUsername.result.description ?? "بررسی شماره با خطا مواجه شد" });
		}
	}, [checkUsername.result]);

	useEffect(() => {
		if (!sendOtp.result) return;
		if (sendOtp.result.success) {
			setErrors([]);
			setOtp("");
			setStep("otp");
			startResendCountdown();
		} else {
			showNotification({ type: "error", message: sendOtp.result.description ?? "ارسال کد تایید با خطا مواجه شد" });
		}
	}, [sendOtp.result]);

	/* ---------- login step ---------- */
	const submitLogin = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!password) errs.push({ item: "password", message: "وارد کردن رمز عبور الزامی است" });
		setErrors(errs);
		if (errs.length > 0) return;
		login.fetchData(username, password);
	};

	useEffect(() => {
		if (!login.result) return;
		if (login.result.success) finalizeAuth(login.result.data?.data);
		else showNotification({ type: "error", message: login.result.description ?? "ورود با خطا مواجه شد" });
	}, [login.result]);

	// ورود با رمز یکبارمصرف: شماره در مرحله‌ی قبل اعتبارسنجی شده، پس فقط کد ارسال می‌شود
	const startLoginWithOtp = () => {
		if (!username) return;
		setErrors([]);
		setOtpMode("login");
		sendLoginOtp.fetchData(username);
	};

	useEffect(() => {
		if (!sendLoginOtp.result) return;
		if (sendLoginOtp.result.success) {
			setErrors([]);
			setOtp("");
			setStep("otp");
			startResendCountdown();
		} else {
			showNotification({ type: "error", message: sendLoginOtp.result.description ?? "ارسال کد تایید با خطا مواجه شد" });
		}
	}, [sendLoginOtp.result]);

	// فراموشی رمز عبور: ارسال کد تایید برای بازیابی رمز
	const startForgotPassword = () => {
		if (!username) return;
		setErrors([]);
		setOtpMode("forgot");
		sendForgetOtp.fetchData(username);
	};

	useEffect(() => {
		if (!sendForgetOtp.result) return;
		if (sendForgetOtp.result.success) {
			setErrors([]);
			setOtp("");
			setStep("otp");
			startResendCountdown();
		} else {
			showNotification({ type: "error", message: sendForgetOtp.result.description ?? "ارسال کد تایید با خطا مواجه شد" });
		}
	}, [sendForgetOtp.result]);

	/* ---------- otp step (shared between signup / login / forgot) ---------- */
	const submitOtp = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!otp) errs.push({ item: "otp", message: "وارد کردن کد تایید الزامی است" });
		else if (otp.length !== 5) errs.push({ item: "otp", message: "کد تایید باید ۵ رقمی باشد" });
		setErrors(errs);
		if (errs.length > 0) return;
		if (otpMode === "login") loginWithOtp.fetchData(username, otp);
		else if (otpMode === "forgot") checkForgetOtp.fetchData(username, otp);
		else checkOtp.fetchData(username, otp);
	};

	useEffect(() => {
		if (!checkOtp.result) return;
		if (checkOtp.result.success) {
			setErrors([]);
			setStep("password");
		} else {
			showNotification({ type: "error", message: checkOtp.result.description ?? "تایید کد با خطا مواجه شد" });
		}
	}, [checkOtp.result]);

	useEffect(() => {
		if (!loginWithOtp.result) return;
		if (loginWithOtp.result.success) finalizeAuth(loginWithOtp.result.data?.data);
		else showNotification({ type: "error", message: loginWithOtp.result.description ?? "ورود با خطا مواجه شد" });
	}, [loginWithOtp.result]);

	useEffect(() => {
		if (!checkForgetOtp.result) return;
		if (checkForgetOtp.result.success) {
			setErrors([]);
			setStep("password");
		} else {
			showNotification({ type: "error", message: checkForgetOtp.result.description ?? "تایید کد با خطا مواجه شد" });
		}
	}, [checkForgetOtp.result]);

	const resendHandler = () => {
		if (resendIn > 0) return;
		setOtp("");
		if (otpMode === "login") sendLoginOtp.fetchData(username);
		else if (otpMode === "forgot") sendForgetOtp.fetchData(username);
		else sendOtp.fetchData(username);
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
		if (otpMode === "forgot") changePasswordApi.fetchData(username, password);
		else setPasswordApi.fetchData(username, password, referralCode.trim() || undefined);
	};

	useEffect(() => {
		if (!setPasswordApi.result) return;
		if (setPasswordApi.result.success) finalizeAuth(setPasswordApi.result.data?.data);
		else showNotification({ type: "error", message: setPasswordApi.result.description ?? "ساخت حساب با خطا مواجه شد" });
	}, [setPasswordApi.result]);

	useEffect(() => {
		if (!changePasswordApi.result) return;
		if (changePasswordApi.result.success) {
			// تغییر رمز توکن برنمی‌گرداند؛ پس مثل فلوی صفحه‌ای کاربر با رمز جدید وارد می‌شود (ورود خودکار نداریم)
			showNotification({ type: "success", message: "رمز عبور با موفقیت تغییر کرد، اکنون وارد شوید" });
			setPassword("");
			setConfirmPassword("");
			setOtp("");
			setErrors([]);
			setStep("login");
		} else {
			showNotification({ type: "error", message: changePasswordApi.result.description ?? "تغییر رمز عبور با خطا مواجه شد" });
		}
	}, [changePasswordApi.result]);

	const usernameLoading = checkUsername.loading || sendOtp.loading;
	const otpChecking = otpMode === "login" ? loginWithOtp.loading : otpMode === "forgot" ? checkForgetOtp.loading : checkOtp.loading;
	const otpResending = otpMode === "login" ? sendLoginOtp.loading : otpMode === "forgot" ? sendForgetOtp.loading : sendOtp.loading;
	const passwordSubmitting = otpMode === "forgot" ? changePasswordApi.loading : setPasswordApi.loading || getProfile.loading;
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
						disabled={login.loading}
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
						disabled={sendForgetOtp.loading}
						className="text-xs text-secondary self-start flex items-center gap-1 hover:gap-1.5 duration-150 disabled:opacity-60"
					>
						{sendForgetOtp.loading ? "در حال ارسال کد..." : "فراموشی رمز عبور"}
						<IconArrowLine width={14} height={14} />
					</button>
					<TabanButton
						type="submit"
						className="!w-full justify-center"
						isLoading={login.loading || getProfile.loading}
						loadingText="در حال ورود"
						disabled={login.loading || getProfile.loading}
					>
						ورود به حساب
					</TabanButton>
					<TabanButton
						variant="bordered"
						type="button"
						onClick={startLoginWithOtp}
						isLoading={sendLoginOtp.loading}
						loadingText="در حال ارسال کد..."
						className="!w-full justify-center"
						disabled={sendLoginOtp.loading}
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
						isLoading={otpChecking || getProfile.loading}
						loadingText={otpMode === "login" ? "در حال ورود" : "در حال بررسی"}
						disabled={otpChecking || getProfile.loading}
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
