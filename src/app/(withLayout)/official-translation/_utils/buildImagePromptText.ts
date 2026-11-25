import { DocLandingPhoto } from "@/types/docLanding.type";

export function buildImagePromptText(photo: DocLandingPhoto): string {
	return [
		photo.prompt,
		`Negative prompt: ${photo.negativePrompt}`,
		`Aspect ratio: ${photo.aspectRatio}. Output size: ${photo.width}x${photo.height} px. Format: WebP, under 250 KB.`,
	].join("\n\n");
}
