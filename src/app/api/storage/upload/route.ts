import { s3 } from "@/core/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
	const formData = await req.formData();
	const files = formData.getAll("files") as File[];

	if (files.length === 0) {
		return new Response("No files provided", { status: 400 });
	}

	const uploadedFiles: string[] = [];

	const promises = files.map(async (file) => {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const key = `uploads/${Date.now()}-${file.name}`;

		const command = new PutObjectCommand({
			Bucket: process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: file.type,
		});

		await s3.send(command);
		const fileUrl = `${process.env.NEXT_PUBLIC_LIARA_ENDPOINT}/${process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME}/${key}`;
		uploadedFiles.push(fileUrl);
	});

	// صبر کن تا همه فایل‌ها آپلود بشن
	await Promise.all(promises);

	return Response.json({
		message: "Files uploaded successfully",
		files: uploadedFiles,
	});
}
