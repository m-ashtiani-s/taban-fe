import { DocLandingPhoto } from "@/types/docLanding.type";

export type LandingPhotoProps = {
	photo: DocLandingPhoto;
	isPreview: boolean;
	placement: string;
	sizes: string;
	className?: string;
};
