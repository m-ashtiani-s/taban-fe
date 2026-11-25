import { DocLandingPhoto } from "@/types/docLanding.type";

export type ImagePromptProps = {
	photo: DocLandingPhoto;
	/** جای این عکس در صفحه، فقط برای راهنمایی سازنده‌ی عکس */
	placement: string;
	className?: string;
};
