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
	const getProfile = useApi(async () => await TabanEndpoints.getProfile());

	const resetAll = () => {
		setStep("username");
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

	/* ---------- otp step ---------- */
	const submitOtp = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!otp) errs.push({ item: "otp", message: "وارد کردن کد تایید الزامی است" });
		else if (otp.length !== 5) errs.push({ item: "otp", message: "کد تایید باید ۵ رقمی باشد" });
		setErrors(errs);
		if (errs.length > 0) return;
		checkOtp.fetchData(username, otp);
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

	const resendHandler = () => {
		if (resendIn > 0) return;
		setOtp("");
		sendOtp.fetchData(username);
	};

	/* ---------- password step ---------- */
	const submitPassword = (e?: FormEvent) => {
		e?.preventDefault();
		const errs: FormErrors[] = [];
		if (!password) errs.push({ item: "password", message: "وارد کردن رمز عبور الزامی است" });
		else if (!passwordRegex.test(password)) errs.push({ item: "password", message: "رمز عبور باید حداقل ۶ کاراکتر و شامل یک حرف و یک عدد باشد" });
		if (!confirmPassword) errs.push({ item: "confirmPassword", message: "وارد کردن تکرار رمز عبور الزامی است" });
		else if (password && password !== confirmPassword) errs.push({ item: "confirmPassword", message: "رمز عبور و تکرار آن مطابقت ندارد" });
		setErrors(errs);
		if (errs.length > 0) return;
		setPasswordApi.fetchData(username, password, referralCode.trim() || undefined);
	};

	useEffect(() => {
		if (!setPasswordApi.result) return;
		if (setPasswordApi.result.success) finalizeAuth(setPasswordApi.result.data?.data);
		else showNotification({ type: "error", message: setPasswordApi.result.description ?? "ساخت حساب با خطا مواجه شد" });
	}, [setPasswordApi.result]);

	const usernameLoading = checkUsername.loading || sendOtp.loading;
	const stepTitle = step === "username" ? "ورود | ثبت نام" : step === "login" ? "ورود" : step === "otp" ? "کد تایید" : "تعیین رمز عبور";

	const goBackToUsername = () => {
		setErrors([]);
		setPassword("");
		setOtp("");
		setStep("username");
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
					<TabanButton
						type="submit"
						className="!w-full justify-center"
						isLoading={login.loading || getProfile.loading}
						loadingText="در حال ورود"
						disabled={login.loading || getProfile.loading}
					>
						ورود به حساب
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
						حسابی با شماره <span dir="ltr">{username}</span> یافت نشد. کد تایید برای ساخت حساب ارسال شد.
					</div>
					<TabanInput
						isLtr
						disabled={checkOtp.loading}
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
						<button type="button" onClick={goBackToUsername} className="text-secondary">
							اصلاح شماره همراه
						</button>
						{resendIn > 0 ? (
							<span className="text-neutral-400">ارسال مجدد تا {resendIn} ثانیه دیگر</span>
						) : (
							<button
								type="button"
								onClick={resendHandler}
								disabled={sendOtp.loading}
								className="text-primary font-medium"
							>
								دریافت مجدد کد
							</button>
						)}
					</div>
					<TabanButton
						type="submit"
						className="!w-full justify-center"
						isLoading={checkOtp.loading}
						loadingText="در حال بررسی"
						disabled={checkOtp.loading}
					>
						ادامه
					</TabanButton>
				</form>
			)}

			{/* password step */}
			{step === "password" && (
				<form className="flex flex-col gap-4 pt-2" onSubmit={submitPassword}>
					<div className="text-sm text-center text-neutral-500">یک رمز عبور برای حساب خود تعیین کنید</div>
					<TabanInput
						isLtr
						isPasswordInput
						disabled={setPasswordApi.loading}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						name="password"
						label="رمز عبور"
						isHandleError
						hasError={!!findError(errors, "password")}
						errorText={findError(errors, "password")?.message}
					/>
					<TabanInput
						isLtr
						isPasswordInput
						disabled={setPasswordApi.loading}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						name="confirmPassword"
						label="تکرار رمز عبور"
						isHandleError
						hasError={!!findError(errors, "confirmPassword")}
						errorText={findError(errors, "confirmPassword")?.message}
					/>
					<TabanInput
						isLtr
						disabled={setPasswordApi.loading}
						value={referralCode}
						onChange={(e) => setReferralCode(e.target.value)}
						name="referralCode"
						label="کد معرف (اختیاری)"
					/>
					<TabanButton
						type="submit"
						className="!w-full justify-center"
						isLoading={setPasswordApi.loading || getProfile.loading}
						loadingText="در حال ساخت حساب"
						disabled={setPasswordApi.loading || getProfile.loading}
					>
						ساخت حساب و ورود
					</TabanButton>
				</form>
			)}
		</TabanModal>
	);
}
