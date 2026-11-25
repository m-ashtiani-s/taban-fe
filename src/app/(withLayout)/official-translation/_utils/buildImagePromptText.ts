import { DocLandingPhoto } from "@/types/docLanding.type";

export function buildImagePromptText(photo: DocLandingPhoto): string {
	if (photo.source === "real") {
		return [photo.prompt, `ابعاد: ${photo.width}×${photo.height} پیکسل (نسبت ${photo.aspectRatio})، WebP، حداکثر ۲۵۰ کیلوبایت.`, `مسیر: public${photo.path}`].join("\n\n");
	}

	return [
		photo.prompt,
		photo.negativePrompt && `Negative prompt: ${photo.negativePrompt}`,
		`Aspect ratio: ${photo.aspectRatio}. Output size: ${photo.width}x${photo.height} px. Format: WebP, under 250 KB.`,
	]
		.filter(Boolean)
		.join("\n\n");
}
