import { NextResponse } from "next/server";
import axios from "axios";
import { WP_URL } from "@/config/global";
import { BlogPostDtoApi } from "../../../_dtos/blogPostDto.type";
import { BlogPostDetailDto } from "@/types/blogPostDetail.type";
import { convertToJalali } from "@/utils/dateConverts";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
	try {
		const endpoint = `${WP_URL}/wp-json/wp/v2/posts?slug=${params.slug}&_embed`;
		const response = await axios.get<BlogPostDtoApi[]>(endpoint);

		if (!response.data.length) {
			return NextResponse.json({ message: "پست پیدا نشد" }, { status: 404 });
		}

		const post = response.data[0];

		const result: BlogPostDetailDto = {
			id: post.id,
			slug: post.slug,
			title: post.title?.rendered,
			content: post.content?.rendered,
			excerpt: post.excerpt?.rendered,
			date: convertToJalali(post.date ?? ""),
			image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
			author: post._embedded?.["author"]?.[0]?.name ?? null,
      rank_math_seo:post?.rank_math_seo
		};

		return NextResponse.json(result);
	} catch (error: any) {
		return NextResponse.json(
			{
				field: "post",
				success: false,
				data: null,
				message: error.message || "خطا در دریافت پست",
			},
			{ status: 500 }
		);
	}
}
