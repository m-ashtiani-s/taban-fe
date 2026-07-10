import { NextResponse } from "next/server";
import axios from "axios";
import { WP_URL } from "@/config/global";
import { TopBannerHomeDtoApi } from "../../_dtos/topBannerDto.type";
import { TopBanner } from "@/types/topBanner.type";

export async function GET() {
	try {
		const endpoint = `${WP_URL}/wp-json/rasmiyab/v1/home`;
		const response = await axios.get<TopBannerHomeDtoApi>(endpoint);

		const media = response.data?.topbanner?.id;
		const link = response.data?.bannerlink;

		if (!media || typeof media === "boolean" || !media.url) {
			return NextResponse.json<TopBanner | null>(null);
		}

		const banner: TopBanner = {
			image: media.url,
			alt: media.alt || media.title || "",
			link: typeof link === "string" && link ? link : null,
			width: media.width ?? null,
			height: media.height ?? null,
		};

		return NextResponse.json(banner);
	} catch (error: any) {
		return NextResponse.json(
			{ field: "topbanner", success: false, data: null, message: error.message || "خطا در دریافت بنر" },
			{ status: 500 }
		);
	}
}
