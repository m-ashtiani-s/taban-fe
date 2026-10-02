import { NextResponse } from "next/server";
import { getTopBanner } from "@/server/wordpress";

export async function GET() {
	return NextResponse.json(await getTopBanner());
}
