import { NextResponse } from "next/server";
import { getPostBySlug } from "@/server/wordpress";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
	try {
		const post = await getPostBySlug(params.slug);
		if (!post) {
			return NextResponse.json({ message: "پست پیدا نشد" }, { status: 404 });
		}
		return NextResponse.json(post);
	} catch (error: any) {
		return NextResponse.json(
			{ field: "post", success: false, data: null, message: error?.message || "خطا در دریافت پست" },
			{ status: 500 }
		);
	}
}
