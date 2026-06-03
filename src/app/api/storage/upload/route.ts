
import { s3 } from "@/core/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
	const formData = await req.formData();
	const files = formData.getAll("files") as File[];

	if (files.length === 0) {
		return new Response("No files provided", { status: 400 });
	}

	const folder = new URL(req.url).searchParams.get("folder") ?? "uploads";
	const uploadedFiles: string[] = [];

	await Promise.all(
		files.map(async (file) => {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const key = `${folder}/${Date.now()}-${file.name}`;

			const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET!;

			const command = new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: buffer,
				ContentType: file.type,
			});

			await s3.send(command);

			const fileUrl = `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${bucket}/${key}`;
			uploadedFiles.push(fileUrl);
		})
	);

	return Response.json({
		message: "Files uploaded successfully",
		files: uploadedFiles,
	});
}
