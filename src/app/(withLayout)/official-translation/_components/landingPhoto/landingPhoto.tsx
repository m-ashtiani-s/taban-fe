import Image from "next/image";
import { LandingPhotoProps } from "./landingPhoto.type";

export default function LandingPhoto({ photo, sizes, className }: LandingPhotoProps) {
	if (!photo.ready) return null;

	const isPortrait = photo.height > photo.width;

	return (
		<Image
			src={photo.path}
			alt={photo.alt}
			width={photo.width}
			height={photo.height}
			sizes={sizes}
			className={`w-full h-auto object-cover ${isPortrait ? "max-w-[420px] mx-auto border border-neutral-100" : ""} ${className ?? ""}`}
		/>
	);
}
