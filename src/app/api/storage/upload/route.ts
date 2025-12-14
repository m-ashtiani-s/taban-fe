import { s3 } from "@/core/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return new Response("No files provided", { status: 400 });
  }

  const promises = files.map(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME,
      Key: `uploads/${file.name}`, // پوشه و اسم دلخواه
      Body: buffer,
      ContentType: file.type,
    });

    return s3.send(command);
  });

  // صبر کن تا همه فایل‌ها آپلود بشن
  await Promise.all(promises);

  return Response.json({ message: "Files uploaded successfully" });
}
