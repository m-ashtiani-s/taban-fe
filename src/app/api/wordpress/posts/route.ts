import { NextResponse } from "next/server";
import axios from "axios";
import { WP_URL } from "@/config/global";
import { BlogPostDto } from "../../_dtos/blogPostDto.type";
import { Paginate } from "@/types/paginate";
import { BlogPost } from "@/styles/blogPost.type";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const page = parseInt(searchParams.get("page") || "1");
	const pageSize = parseInt(searchParams.get("pageSize") || "10");
	const term = searchParams.get("term") || "";
	
	try {
		const endpoint = `${WP_URL}/wp-json/wp/v2/posts?_embed&per_page=${pageSize}&page=${page}${term ? `&search=${encodeURIComponent(term)}` : ""}`;
		const response = await axios.get<BlogPostDto[]>(endpoint);
		

		const posts: BlogPost[] = response.data.map((post) => ({
			id: post.id,
			slug: post.slug,
			title: post.title.rendered,
			excerpt: post.excerpt.rendered,
			date: post.date,
			image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
		}));

		const paginatedResult: Paginate<BlogPost> = {
			page,
			pageSize,
			totalPages: parseInt(response.headers["x-wp-totalpages"] ?? "1"),
			totalElements: parseInt(response.headers["x-wp-total"] ?? String(posts.length)),
			elements: posts,
		};

		return NextResponse.json(paginatedResult);
	} catch (error: any) {
		return NextResponse.json(
			{ field: "posts", success: false, data: null, message: error.message || "مشکلی در تایید کد تایید رخ داد" },
			{ status: 500 }
		);
	}
}
