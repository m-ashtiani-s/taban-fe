import { SITE_URL } from "@/config/global";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import Comments from "../_components/postComment/commentsList";
import PostComment from "../_components/postComment/postcomment";

async function getPost(slug: string) {
	try {
		const res = await fetch(`${SITE_URL}/api/wordpress/posts/${slug}`, {
			next: {
				revalidate: 1,
			},
		});
		const data = await res.json();
		return data;
	} catch (error) {
		return null;
	}
}
// async function getAllPosts() {
// 	try {
// 		const res = await fetch(`${API_URL}/wp-json/wp/v2/posts?per_page=100&_sort=date`);
// 		const data = await res.json();
// 		return data;
// 	} catch (error) {
// 		return null;
// 	}
// }

// async function getPostsByIds(postIds: number[]) {
// 	try {
// 		const ids = postIds.join(",");
// 		const res = await fetch(`${API_URL}/wp-json/wp/v2/posts?include=${ids}`);
// 		const posts = await res.json();
// 		return posts;
// 	} catch (error) {
// 		return null;
// 	}
// }

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const post = await getPost(params.slug);
	if (post) {
		return {
			title: `${post?.rank_math?.title || `${post.title.rendered} - ماهکس`}`,
			description: post?.rank_math?.description || post.excerpt?.rendered || "توضیحات پست",
		};
	}

	return {
		title: "پست پیدا نشد",
		description: "پستی با این اسلاگ پیدا نشد.",
	};
}

// async function getImage(id: number) {
// 	try {
// 		const res = await fetch(`${API_URL}/wp-json/custom/v1/media/${id}`, {
// 			next: {
// 				revalidate: 1,
// 			},
// 		});

// 		if (!res.ok) {
// 			throw new Error("Network response was not ok");
// 		}

// 		return res.json();
// 	} catch (error) {
// 		return null;
// 	}
// }

export default async function Page({ params }: { params: { slug: string } }) {
	const blogPageData: any | null = await getPost(params?.slug);

	return (
		<>
			{/* <Script id="BlogPosting-schema" type="application/ld+json" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /> */}
			{/* 
			{blogPageData?.acf?.schema &&
				blogPageData?.acf?.schema?.length > 0 &&
				blogPageData?.acf?.schema?.map((it: any, index: number) => (
					<Script
						id={it?.id || index}
						type="application/ld+json"
						strategy="beforeInteractive"
						dangerouslySetInnerHTML={{ __html: it?.schemaItem?.replaceAll("\t", "")?.replaceAll("\n", "")?.replaceAll("\r", "") }}
					/>
				))} */}

			<section className="bg-primary">
				<div className="container">
					<div className="py-16 flex items-center justify-center flex-col gap-2">
						<div className="peyda text-3xl font-semibold text-white">{blogPageData?.title}</div>
						<div className="text-neutral-200 flex gap-4 items-center mt-1">
							<div className="">{blogPageData?.date?.split(" ")[0]}</div>
							<div className="h-4 w-[1px] bg-neutral-200 relative -top-0.5"></div>
							<div className="">{blogPageData?.author}</div>
						</div>
						<div className="flex w-full justify-center"></div>
					</div>
				</div>
			</section>

			<div className="h-10 lg:!h-20"></div>
			<section>
				<div className="container border-b border-b-secondary pb-10">
					<div className="flex gap-4">
						<div
							style={{ backgroundImage: `url('${blogPageData?.image}')` }}
							className="min-w-36 h-24 !bg-cover rounded-md shadow-md"
						></div>
						<div className="flex flex-col gap-4">
							<div className="peyda text-xl font-semibold flex items-center gap-4">
								{blogPageData?.title}
								<div className="h-4 w-[1px] bg-neutral-200 relative -top-0.5"></div>
								<div className="text-sm font-normal">{blogPageData?.date?.split(" ")[0]}</div>
								<div className="h-4 w-[1px] bg-neutral-200 relative -top-0.5"></div>
								<div className="text-sm font-normal">{blogPageData?.author}</div>
							</div>
							<div className="text-sm" dangerouslySetInnerHTML={{ __html: blogPageData?.excerpt || "" }}></div>
						</div>
					</div>
				</div>
			</section>
			<div className="h-10 lg:!h-20"></div>
			<section className="">
				<div className="container px-4">
					<div
						className="!leading-7 [&>*]:mt-4 [&>*]:max-w-full [&_>p>img]:mx-auto [&_table]:text-sm [&_tr]:border-b  [&_tr:nth-last-child(1)]:border-none [&_tr]:border-b-neutral-200 [&_td]:border-l [&_td]:border-l-neutral-200 [&_td]:p-1 [&_td:nth-last-child(1)]:border-none [&_a]:text-secondary"
						dangerouslySetInnerHTML={{ __html: blogPageData?.content || "" }}
					></div>
				</div>
			</section>
			<div className="h-10 lg:!h-20"></div>
			<div className="flex container border-b border-b-secondary pb-4">
				<div className="flex items-center gap-2 peyda font-semibold">
					<div className="text-primary  text-lg">نظرات شما</div>
					<div className="h-10 w-0.5 bg-secondary"></div>
					<div className="text-secondary  text-lg">کاربران رسمی یاب درباره این مقاله گفته اند:</div>
				</div>
			</div>
			<section className="">
				<div className="container px-4">
					<Comments id={blogPageData?.id} />
					<PostComment id={blogPageData?.id} />
				</div>
			</section>
			<div className="h-10 lg:!h-20"></div>

			{/* <section className="">
				<div className="container px-4">
					<div className="border-y border-neutral-4 py-4 flex justify-between">
						<div>
							{prevPost && (
								<Link className="flex items-center gap-2" href={`/${prevPost.slug}`}>
									<IconArrowLeft className="!rotate-180" />

									<div className="flex flex-col gap-1">
										<div className="text-sm font-medium text-primary">پست قبلی</div>
										<div className="text-sm" dangerouslySetInnerHTML={{ __html: prevPost.title.rendered || "" }}></div>
									</div>
								</Link>
							)}
						</div>
						<div>
							{nextPost && (
								<Link className="flex items-center gap-2" href={`/${nextPost.slug}`}>
									<div className="flex flex-col gap-1 items-end">
										<div className="text-sm font-medium text-primary">پست بعدی</div>
										<div className="text-sm" dangerouslySetInnerHTML={{ __html: nextPost.title.rendered || "" }}></div>
									</div>

									<IconArrowLeft className="" />
								</Link>
							)}
						</div>
					</div>
				</div>
			</section>
			<div className="h-10 lg:!h-20"></div>
			<section className="">
				<div className="container px-4">
					<Comments id={post?.id} />
					<PostComment id={post?.id} />
				</div>
			</section>
			<div className="h-10 lg:!h-20"></div>
			{relatedPosts && relatedPosts?.length > 0 && (
				<>
					<section className="">
						<div className="container px-4">
							<div className="flex flex-col justify-center items-center mb-6">
								<div className="text-lg font-semibold text-primary">پست های مرتبط</div>
								<div className="w-16 h-1 bg-secondary mt-1"></div>
							</div>
							<div className="flex gap-8 flex-col lg:!flex-row">
								{relatedPosts?.slice(0, 3)?.map((it) => (
									//@ts-ignore
									<BlogCart post={it} key={it?.id} />
								))}
							</div>
						</div>
					</section>
					<div className="h-10 lg:!h-20"></div>
				</>
			)} */}
		</>
	);
}
