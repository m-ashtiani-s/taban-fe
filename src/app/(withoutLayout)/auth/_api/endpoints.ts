import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Login } from "../_types/login.type";
import { Paginate } from "@/types/paginate";
import { Province } from "@/types/Province.type";
import { City } from "@/types/city.type";
import { toEnglishDigits } from "@/utils/string";

// ورودی‌های فلوی احراز هویت ممکن است از URL بیایند (نه از اینپوت)، پس اینجا هم
// ارقام فارسی/عربی به انگلیسی تبدیل می‌شوند تا بک‌اند همیشه رقم انگلیسی بگیرد.
export const AuthEndpoints = {
	checkUsername: async (username: string) => {
		const res = await httpClient.call<Res<boolean>>({
			method: "GET",
			url: `v1/auth/check-username`,
			params: { username: toEnglishDigits(username) },
		});
		return res?.data;
	},
	sendOTP: async (username: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "POST",
			url: `v1/auth/sign-up/otp/send`,
			data: { username: toEnglishDigits(username) },
		});
		return res?.data;
	},
	login: async (username: string, password: string) => {
		const res = await httpClient.call<Res<Login>>({
			method: "POST",
			url: `v1/auth/login`,
			data: { username: toEnglishDigits(username), password: toEnglishDigits(password) },
		});
		return res?.data;
	},
	checkOTP: async (username: string, otp: string) => {
		const res = await httpClient.call<Res<boolean>>({
			method: "POST",
			url: `v1/auth/sign-up/otp/check`,
			data: { username: toEnglishDigits(username), otp: toEnglishDigits(otp) },
		});
		return res?.data;
	},
	setPassword: async (username: string, password: string, referralCode?: string) => {
		const res = await httpClient.call<Res<Login>>({
			method: "POST",
			url: `v1/auth/sign-up/set-password`,
			data: {
				username: toEnglishDigits(username),
				password: toEnglishDigits(password),
				...(referralCode ? { referralCode: toEnglishDigits(referralCode) } : {}),
			},
		});
		return res?.data;
	},
	// --- ورود با رمز یکبارمصرف ---
	sendLoginOTP: async (username: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "POST",
			url: `v1/auth/login/otp/send`,
			data: { username: toEnglishDigits(username) },
		});
		return res?.data;
	},
	loginWithOTP: async (username: string, otp: string) => {
		const res = await httpClient.call<Res<Login>>({
			method: "POST",
			url: `v1/auth/login/otp/check`,
			data: { username: toEnglishDigits(username), otp: toEnglishDigits(otp) },
		});
		return res?.data;
	},
	// --- فراموشی رمز عبور ---
	sendForgetPasswordOTP: async (username: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "POST",
			url: `v1/auth/forget-password/otp/send`,
			data: { username: toEnglishDigits(username) },
		});
		return res?.data;
	},
	checkForgetPasswordOTP: async (username: string, otp: string) => {
		const res = await httpClient.call<Res<boolean>>({
			method: "POST",
			url: `v1/auth/forget-password/otp/check`,
			data: { username: toEnglishDigits(username), otp: toEnglishDigits(otp) },
		});
		return res?.data;
	},
	changePassword: async (username: string, password: string) => {
		const res = await httpClient.call<Res<null>>({
			method: "POST",
			url: `v1/auth/forget-password/set-password`,
			data: { username: toEnglishDigits(username), password: toEnglishDigits(password) },
		});
		return res?.data;
	},
	getProvinces: async (term: string) => {
		const res = await httpClient.call<Res<Paginate<Province>>>({
			method: "GET",
			url: `v1/provinces`,
			params: { term },
		});
		return res?.data;
	},
	getCities: async (term: string, provinceId?: number) => {
		const res = await httpClient.call<Res<Paginate<City>>>({
			method: "GET",
			url: `v1/cities`,
			params: { term, provinceId },
		});
		return res?.data;
	},
};
