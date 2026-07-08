
import { s3 } from "@/core/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20;

type DetectedKind = "jpeg" | "png" | "gif" | "webp" | "bmp" | "pdf";

const EXTENSION_BY_KIND: Record<DetectedKind, string> = {
	jpeg: "jpg",
	png: "png",
	gif: "gif",
	webp: "webp",
	bmp: "bmp",
	pdf: "pdf",
};

// نوع واقعی فایل از روی magic bytes تشخیص داده می‌شود، نه از روی پسوند یا
// Content-Type ادعاشده‌ی کلاینت (که هر دو به‌سادگی spoof می‌شوند). SVG عمداً
// پشتیبانی نمی‌شود چون می‌تواند حاوی اسکریپت باشد (ریسک XSS).
function detectFileKind(buffer: Buffer): DetectedKind | null {
	if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
	if (buffer.length >= 8 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return "png";
	if (buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "GIF8") return "gif";
	if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) return "bmp";
	if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
	if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") return "pdf";
	return null;
}

// نام اصلی فقط برای خوانایی کلید ذخیره‌سازی استفاده می‌شود؛ پسوند نهایی همیشه
// از روی kind تشخیص‌داده‌شده ساخته می‌شود، نه از روی نام فایل کلاینت.
function sanitizeBaseName(name: string): string {
	const withoutExtension = name.replace(/\.[^./\\]+$/, "");
	const cleaned = withoutExtension
		.replace(/[^a-zA-Z0-9_-]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
	return cleaned.slice(0, 60) || "file";
}

function errorResponse(message: string, status: number) {
	return Response.json({ message }, { status });
}

export async function POST(req: Request) {
	const formData = await req.formData();
	const files = formData.getAll("files") as File[];

	if (files.length === 0) {
		return errorResponse("هیچ فایلی ارسال نشده است", 400);
	}
	if (files.length > MAX_FILES) {
		return errorResponse(`حداکثر ${MAX_FILES} فایل در هر آپلود مجاز است`, 400);
	}

	const validated: { file: File; buffer: Buffer; kind: DetectedKind }[] = [];
	for (const file of files) {
		if (file.size > MAX_FILE_SIZE_BYTES) {
			return errorResponse(`حجم فایل «${file.name}» بیشتر از حد مجاز (۱۰ مگابایت) است`, 400);
		}
		const buffer = Buffer.from(await file.arrayBuffer());
		const kind = detectFileKind(buffer);
		if (!kind) {
			return errorResponse(`فرمت فایل «${file.name}» مجاز نیست؛ فقط تصویر (jpg, png, gif, webp, bmp) و pdf پذیرفته می‌شود`, 400);
		}
		validated.push({ file, buffer, kind });
	}

	const folder = new URL(req.url).searchParams.get("folder") ?? "uploads";
	const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET!;
	const uploadedFiles: string[] = new Array(validated.length);

	await Promise.all(
		validated.map(async ({ file, buffer, kind }, index) => {
			const key = `${folder}/${Date.now()}-${index}-${sanitizeBaseName(file.name)}.${EXTENSION_BY_KIND[kind]}`;

			const command = new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: buffer,
				ContentType: file.type,
			});

			await s3.send(command);

			uploadedFiles[index] = `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${bucket}/${key}`;
		})
	);

	return Response.json({
		message: "Files uploaded successfully",
		files: uploadedFiles,
	});
}
