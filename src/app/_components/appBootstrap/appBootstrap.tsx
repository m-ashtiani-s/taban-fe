"use client";

import { useProfile } from "@/hooks/useProfile";

/**
 * بوت‌استرپ سمت کلاینت اپ: پروفایلِ کاربر را در ریشه‌ی اپ یک‌بار مانت می‌کند تا کش
 * ["profile", "detail"] از همان ابتدا پر شود و بقیه‌ی کامپوننت‌ها از همان کش بخوانند.
 *
 * دیگر استور و sync دستی وجود ندارد؛ خودِ useProfile (React Query) کش/دِدآپ را مدیریت می‌کند.
 */
export default function AppBootstrap() {
	useProfile();
	return null;
}
