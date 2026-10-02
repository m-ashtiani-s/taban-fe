import { NextResponse } from "next/server";
import { getPostsPage } from "@/server/wordpress";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
	const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10) || 10));
	const term = searchParams.get("term") || "";

	try {
		const result = await getPostsPage({ page, pageSize, term });
		if (!result) {
			return NextResponse.json({ field: "posts", success: false, data: null, message: "این صفحه از مقالات وجود ندارد" }, { status: 404 });
		}
		return NextResponse.json(result);
	} catch (error: any) {
		return NextResponse.json(
			{ field: "posts", success: false, data: null, message: error?.message || "خطا در دریافت مقالات" },
			{ status: 500 }
		);
	}
}
