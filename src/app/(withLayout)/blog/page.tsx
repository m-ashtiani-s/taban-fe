import BlogPost from "@/app/_components/blogPost/blogPost";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { IconArrow } from "@/app/_components/icon/icons";
import { SITE_URL, WP_URL } from "@/config/global";
import { BlogPostDto } from "@/types/blogPost.type";
import { Paginate } from "@/types/paginate";
import Link from "next/link";

async function getPosts(page: number = 1, perPage: number = 5): Promise<Paginate<BlogPostDto> | null> {
	try {
		const res = await fetch(`${SITE_URL}/api/wordpress/posts?page=${page}&pageSize=${perPage}`, {
			next: { revalidate: 1 },
		});

		if (!res.ok) {
			console.error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
			return null;
		}
		const data = await res.json();
		return data;
	} catch (error) {
		console.error("Error fetching posts:", error);
		return null;
	}
}

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
	const currentPage = parseInt(searchParams.page || "1", 10);
	const perPage = 9;

	const blogPageData: Paginate<BlogPostDto> | null = await getPosts(currentPage, perPage);

	if (!blogPageData) {
		return (
			<>
				<h1>خطا در دریافت داده‌ها</h1>
				<p>متاسفانه در بارگذاری اطلاعات مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.</p>
			</>
		);
	}


	return (
		<>
			<title>رسمی‌یاب | پلتفرمم آنلاین ترجمه رسمی</title>
			<section className="bg-primary">
				<div className="container">
					<div className="py-16 flex items-center justify-center flex-col gap-2">
						<div className="peyda text-3xl font-semibold text-white">مجله خبری ما</div>
						<div className="text-neutral-200">جدیدترین اخبار و مقالات در حوزه ترجمه مدارک رسمی</div>
						<div className="flex w-full justify-center">
							<div className="w-8/12 relative mt-2">
								<TabanInput
									placeholder="جستجو در مطالب بلاگ"
									inputClassName="!bg-primary !border-white !text-white placeholder:text-white !h-10 !pt-1"
								/>
								<button className="absolute left-2 bg-white top-2 px-4 rounded">جستجو</button>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="mt-12">
				<div className="container">
					<div className="flex flex-wrap">
						{blogPageData?.elements?.map((post) => (
							<div className="p-3 w-1/3">
								<BlogPost key={post?.id} post={post} />
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="mt-12">
				<div className="container">
					<div className="flex gap-4 items-center justify-center">
						{
							<TabanButton disabled={currentPage === 1} variant="icon" isLink href={`?page=${currentPage - 1}`}>
								<IconArrow className="fill-primary stroke-primary stroke-1 rotate-90" />
							</TabanButton>
						}
						<div className="">صفحه {currentPage} از {blogPageData?.totalPages}</div>
						{
							<TabanButton
								disabled={currentPage === blogPageData?.totalPages}
								variant="icon"
								isLink
								href={`?page=${currentPage + 1}`}
							>
								<IconArrow className="fill-primary stroke-primary stroke-1 -rotate-90" />
							</TabanButton>
						}
					</div>
				</div>
			</section>
		</>
	);
}
