import Image from "next/image";
import TabanButton from "./_components/common/tabanButton/tabanButton";
import { Footer } from "./_components/footer/footer";
import { Header } from "./_components/header/header";
import { IconTranslate } from "./_components/icon/icons";
import Map from "./_homeAssets/_components/map/map";
import CommentsSlider from "./_homeAssets/_components/commentsSlider/commentsSlider";
import { comments } from "@/constants/comments";
import BlogPreview from "./_homeAssets/_components/BlogPreview/BlogPreview";
import { BlogPost } from "@/styles/blogPost.type";
import { SITE_URL } from "@/config/global";
import { Paginate } from "@/types/paginate";

async function getPosts(): Promise<Paginate<BlogPost> | null> {
	try {
		const res = await fetch(`${SITE_URL}/api/wordpress/posts?page=1&pageSize=10`, {
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

export default async function Home() {
	const blogPageData: Paginate<BlogPost> | null = await getPosts();
	return (
		<>
			<Header />
			<main className="">
				<section className="">
					<div className="bg-[url('/images/herobg.jpg')] lg:!h-[600px] 2xl:!h-[650px]  !bg-cover !bg-top peyda">
						<div className="container  flex items-start justify-center flex-col h-full gap-8">
							<div className="text-neutral-200">
								سریع ترین راه ترجمه مدارک رسمی شما به شکل{" "}
								<span className="text-secondary font-semibold">آنلاین و حضوری</span>
							</div>
							<div className="text-neutral-200 text-5xl font-semibold">دارالترجمــــه رسمی تـــــابان</div>
							<TabanButton
								variant="contained"
								isLink
								href="/translate-order"
								className="font-semibold group !border-none rounded flex items-center gap-2 !bg-secondary"
							>
								<IconTranslate stroke="black" strokeWidth={0} className=" fill-white duration-200" />
								شروع ترجمه آنلاین
							</TabanButton>
						</div>
					</div>
				</section>
				<div className="h-24"></div>
				<section>
					<div className="bg-[url('/images/servicebg.jpg')] !bg-cover !bg-center">
						<div className="container  flex items-center gap-32 h-full">
							<div className="w-full">
								<div className="flex gap-6">
									<div className="pt-20 flex flex-col gap-4">
										<div className="group rounded-2xl border border-neutral-400 p-4 w-56 bg-white duration-200 hover:bg-primary">
											<Image
												src="/images/home/iconService1.svg"
												height={38}
												width={38}
												alt="service"
											/>
											<div className="peyda font-semibold text-neutral-600 mt-4 text-lg duration-200 group-hover:text-neutral-100">
												تحویل سریع مدارک
											</div>
											<div className="text-neutral-500 mt-1 duration-200 group-hover:text-neutral-300">
												لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
												استفاده از طراحان گرافیک ها و متون بلکه روزنامهر
											</div>
										</div>
										<div className="group rounded-2xl border border-neutral-400 p-4 w-56 bg-white duration-200 hover:bg-primary">
											<Image
												src="/images/home/iconService1.svg"
												height={38}
												width={38}
												alt="service"
											/>
											<div className="peyda font-semibold text-neutral-600 mt-4 text-lg duration-200 group-hover:text-neutral-100">
												تحویل سریع مدارک
											</div>
											<div className="text-neutral-500 mt-1 duration-200 group-hover:text-neutral-300">
												لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
												استفاده از طراحان گرافیک ها و متون بلکه روزنامهر
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-4">
										<div className="group rounded-2xl border border-neutral-400 p-4 w-56 bg-white duration-200 hover:bg-primary">
											<Image
												src="/images/home/iconService1.svg"
												height={38}
												width={38}
												alt="service"
											/>
											<div className="peyda font-semibold text-neutral-600 mt-4 text-lg duration-200 group-hover:text-neutral-100">
												تحویل سریع مدارک
											</div>
											<div className="text-neutral-500 mt-1 duration-200 group-hover:text-neutral-300">
												لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
												استفاده از طراحان گرافیک ها و متون بلکه روزنامهر
											</div>
										</div>
										<div className="group rounded-2xl border border-neutral-400 p-4 w-56 bg-white duration-200 hover:bg-primary">
											<Image
												src="/images/home/iconService1.svg"
												height={38}
												width={38}
												alt="service"
											/>
											<div className="peyda font-semibold text-neutral-600 mt-4 text-lg duration-200 group-hover:text-neutral-100">
												تحویل سریع مدارک
											</div>
											<div className="text-neutral-500 mt-1 duration-200 group-hover:text-neutral-300">
												لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
												استفاده از طراحان گرافیک ها و متون بلکه روزنامهر
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="w-full flex">
								<div className="flex flex-col gap-4 relative">
									<div className="absolute -right-52 top-[calc(50%-30px)] flex">
										<Image
											src="/images/home/serviceShow.png"
											alt=""
											className="w-36 "
											width={114}
											height={80}
										/>
									</div>

									<div className="text-3xl font-medium peyda">
										تابان چه <span className="text-secondary font-semibold">خدماتی</span> ارائه
										میدهد؟
									</div>
									<div className="pl-32">
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
										طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
										لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود{" "}
									</div>
									<TabanButton isLink href="/about-us" className="">
										با ما بیشتر آشنا شوید
									</TabanButton>
								</div>
							</div>
						</div>
					</div>
				</section>
				<div className="h-20"></div>
				<section>
					<div className="container relative py-20">
						<div className="absolute top-0 right-80 z-[1]">
							<Image src="/images/home/pannelbg.svg" alt="" className="" width={474} height={601} />
						</div>
						<div className="flex gap-16 items-center relative z-[2]">
							<div className="w-full flex flex-col gap-4">
								<div className="text-4xl peyda font-semibold">
									<span className="text-secondary">ویژگی های</span> پنل مشتریان
								</div>
								<div className="pl-32 leading-7">
									لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک
									است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط
									فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود{" "}
								</div>
								<TabanButton isLink href="/auth" className="">
									همین حالا عضو شوید
								</TabanButton>
							</div>
							<div className="w-full flex flex-col gap-8">
								<div className="flex items-start gap-4 ">
									<div className="h-[50px] w-[50px] flex items-center justify-center rounded-full bg-primary relative">
										<div className="w-[1px] bg-neutral-300 top-[calc(100%+8px)] right-6 h-[80px] absolute"></div>
										<Image src="/images/home/iconPannel1.svg" width={28} height={28} alt="" />
									</div>
									<div className="flex flex-col gap-1">
										<div className="peyda font-semibold text-lg pt-2.5">بایگانی مدارک</div>
										<div className="text-neutral-500 max-w-[353px]">
											لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده
											از طراحان گرافیک ه طراحان گرافیک ها و متون بلکه روزنامهر
										</div>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="h-[50px] w-[50px] flex items-center justify-center rounded-full bg-primary relative">
										<div className="w-[1px] bg-neutral-300 top-[calc(100%+8px)] right-6 h-[80px] absolute"></div>
										<Image src="/images/home/iconPannel2.svg" width={28} height={28} alt="" />
									</div>
									<div className="flex flex-col gap-1">
										<div className="peyda font-semibold text-lg pt-2.5">شفافیت مالی</div>
										<div className="text-neutral-500 max-w-[353px]">
											لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده
											از طراحان گرافیک ه طراحان گرافیک ها و متون بلکه روزنامهر
										</div>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="h-[50px] w-[50px] flex items-center justify-center rounded-full bg-primary">
										<Image src="/images/home/iconPannel3.svg" width={28} height={28} alt="" />
									</div>
									<div className="flex flex-col gap-1">
										<div className="peyda font-semibold text-lg pt-2.5">
											مشاهده روند ترجمه مدارک
										</div>
										<div className="text-neutral-500 max-w-[353px]">
											لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده
											از طراحان گرافیک ه طراحان گرافیک ها و متون بلکه روزنامهر
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<div className="h-24"></div>
				<section>
					<div className="bg-[url('/images/home/countrybg.webp')] !bg-cover !bg-center py-10 w-full relative bg-fixed">
						<div className="absolute z-[1] w-8/12 h-full right-0 top-0 bg-gradient-to-l from-primary to-primary/0"></div>
						<div className="container flex items-center gap-4 relative z-[2]">
							<div className="w-full flex flex-col gap-4">
								<div className="peyda text-neutral-300 text-3xl font-medium">
									ثبت سفارش آنلاین ترجمه از سراسر کشور
								</div>
								<div className="flex items-center gap-1 text-neutral-300 mt-2">
									<Image src="/images/home/iconCountryBox1.svg" height={27} width={27} alt="service" />
									سفارش آنلاین ترجمه
								</div>
								<div className="flex items-center gap-1 text-neutral-300">
									<Image src="/images/home/iconCountryBox2.svg" height={27} width={27} alt="service" />
									ارسال مدارک از و به سراسر کشور
								</div>
								<TabanButton
									variant="contained"
									isLink
									href="/translate-order"
									className="font-semibold group !border-none rounded flex items-center gap-2 !bg-secondary mt-6"
								>
									<IconTranslate stroke="black" strokeWidth={0} className=" fill-white duration-200" />
									شروع ترجمه آنلاین
								</TabanButton>
							</div>
							<div className="w-full">
								<Map />
							</div>
						</div>
					</div>
				</section>
				<div className="h-32"></div>
				<section>
					<div className="container">
						<div className="flex flex-col items-center gap-14">
							<Image src="/images/home/b2bPannel.png" width={360} height={290} alt="b2b" />
							<div className="flex flex-col items-center gap-4">
								<div className="text-3xl font-medium peyda">
									پنل مشتریان سازمانی <span className="text-secondary font-semibold">تابان</span>
								</div>
								<div className="w-8/12 leading-7 text-center">
									لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گراف
									یک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط
									فعلی تکنولوژی مورد نیاز، و کاربردهاییک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و
									سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف
									بهبود{" "}
								</div>
								<TabanButton isLink href="/auth" className="">
									همین حالا عضو شوید
								</TabanButton>
							</div>
						</div>
					</div>
				</section>
				<div className="h-32"></div>
				<section>
					<div className="h-[450px] bg-gradient-to-l from-[#040e27] to-primary relative">
						<div className="w-full absolute h-full flex items-center justify-center z-[1]">
							<Image src="/images/home/commentbg.svg" height={450} width={790} className="!h-full mx-auto" alt="" />
						</div>
						<div className="container z-[2] py-10">
							<div className="flex flex-col items-center gap-3">
								<div className="peyda font-semibold text-2xl text-neutral-200">نظر همراهان تابان</div>
								<div className="text text-neutral-200">
									کاربران تابان در مورد تجربه خود از ترجمه های ما گفته اند
								</div>
								<div className="w-[1018px]">
									<CommentsSlider comments={comments} />
								</div>
							</div>
						</div>
					</div>
				</section>
				<div className="h-32"></div>
				<section>
					<div className="container">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 peyda font-semibold">
								<div className="text-primary  text-lg">مجله تابان</div>
								<div className="h-10 w-0.5 bg-secondary"></div>
								<div className="text-secondary  text-lg">جدیدترین نکات و مقالات</div>
							</div>
							<TabanButton isLink href="/blog" className="">
								وبلاگ تابان
							</TabanButton>
						</div>
						<div className="w-full mt-8">{!blogPageData ? null : <BlogPreview posts={blogPageData?.elements} />}</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
