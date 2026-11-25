import Image from "next/image";
import ImagePrompt from "../imagePrompt/imagePrompt";
import { LandingPhotoProps } from "./landingPhoto.type";

export default function LandingPhoto({ photo, isPreview, placement, sizes, className }: LandingPhotoProps) {
	if (photo.ready) {
		return (
			<Image
				src={photo.path}
				alt={photo.alt}
				width={photo.width}
				height={photo.height}
				sizes={sizes}
				className={`w-full h-auto object-cover ${className ?? ""}`}
			/>
		);
	}

	if (!isPreview) return null;

	return <ImagePrompt photo={photo} placement={placement} className={className} />;
}
