
import { WP_URL } from "@/config/global";
import Link from "next/link";

async function getPage(page: number = 1, perPage: number = 5) {
	try {
		const res = await fetch(
			`${WP_URL}/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}`,
			{ next: { revalidate: 1 } } // تنظیم زمان رفرش کردن
		);
		if (!res.ok) {
			throw new Error(`خطا در دریافت داده‌ها: ${res.status} - ${res.statusText}`);
		}
		return await res.json();
	} catch (error) {
		console.error("خطا در فراخوانی API:", error);
		return null;
	}
}

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
	const currentPage = parseInt(searchParams.page || "1", 10);
	const perPage = 2;

	const blogPageData = await getPage(currentPage, perPage);

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
			<h1>وبلاگ ماهکس</h1>
			{blogPageData?.map((post: any) => (
				<div key={post?.id} className="mt-6">
					<h2>{post?.title?.rendered}</h2>
					<p>{post?.excerpt?.rendered}</p>
				</div>
			))}

			{/* دکمه‌های صفحه‌بندی */}
			<div className="mt-6">
				{currentPage > 1 && (
					<Link href={`?page=${currentPage - 1}`}>
						صفحه قبلی
					</Link>
				)}
				<Link href={`?page=${currentPage + 1}`}>
					صفحه بعدی
				</Link>
			</div>
		</>
	);
}