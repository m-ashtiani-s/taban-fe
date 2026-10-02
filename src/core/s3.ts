import { S3Client } from "@aws-sdk/client-s3";

// فقط-سروری: کلیدها عمداً بدون پیشوند NEXT_PUBLIC_ هستند تا هیچ import اشتباهی در کلاینت آن‌ها را وارد باندل عمومی نکند
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
export const MINIO_BUCKET = process.env.MINIO_BUCKET;

export const s3 = new S3Client({
	region: "us-east-1",
	endpoint: MINIO_ENDPOINT,
	credentials: {
		accessKeyId: process.env.MINIO_ACCESS_KEY!,
		secretAccessKey: process.env.MINIO_SECRET_KEY!,
	},
	forcePathStyle: true,
});
