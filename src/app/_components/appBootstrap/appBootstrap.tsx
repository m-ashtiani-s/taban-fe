"use client";

import { useEffect } from "react";
import { useProfiletore } from "@/stores/profile";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";

/**
 * بوت‌استرپ سمت کلاینت اپ (واکشی پروفایل کاربر).
 *
 * این منطق قبلاً داخل RootLayout بود و باعث می‌شد layout اجباراً client شود و
 * نتوانیم از Metadata API سرور استفاده کنیم. حالا layout سرور است و این کامپوننت
 * فقط side-effect را اجرا می‌کند و چیزی رندر نمی‌کند.
 */
export default function AppBootstrap() {
	const { setProfile, setLoading } = useProfiletore();
	const showNotification = useNotificationStore((state) => state.showNotification);
	const { result: profileResult, fetchData: executeProfile } = useApi(async () => await TabanEndpoints.getProfile());

	useEffect(() => {
		setLoading(true);
		executeProfile();
	}, []);

	useEffect(() => {
		if (profileResult) {
			setLoading(false);
			if (profileResult?.success) {
				setProfile(profileResult?.data?.data);
			} else {
				setProfile(null);
				profileResult?.statusCode !== 401 &&
					showNotification({
						type: "error",
						message: profileResult?.description ?? "دریافت پروفایل با خطا مواجه شد",
					});
			}
		}
	}, [profileResult]);

	return null;
}
