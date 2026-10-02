import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import TabanButton from "./_components/common/tabanButton/tabanButton";
import { Footer } from "./_components/footer/footer";
import { Header } from "./_components/header/header";
import { IconTranslate } from "./_components/icon/icons";
import CommentsSlider from "./_homeAssets/_components/commentsSlider/commentsSlider";
import { comments } from "@/constants/comments";
import { BlogPostDto } from "@/types/blogPost.type";
import { Paginate } from "@/types/paginate";
import HeroOrderStart from "./_homeAssets/_components/heroOrderStart/heroOrderStart";
import Reveal from "./_components/common/reveal/reveal";
import { steps } from "./_homeAssets/_constants/steps";
import { services } from "./_homeAssets/_constants/services";
import { HOME_CUSTOMER_PANEL, HOME_ENTERPRISE, HOME_FAQS, HOME_HERO, HOME_SERVICES } from "./_homeAssets/_constants/homeContent";
import BlogPreview from "./_homeAssets/_components/blogPreview/blogPreview";
import Faq from "./_components/faq/faq";
import JsonLd from "./_components/jsonLd/jsonLd";
import { SITE_DESCRIPTION, SITE_TITLE, buildFaqPage, buildMetadata } from "@/config/site";
import { docLandingPath } from "@/config/docLandings";
import { getPostsPage } from "@/server/wordpress";
import { getLiveDocLandings } from "@/server/docLandings";

export const metadata: Metadata = buildMetadata({
	title: SITE_TITLE,
	absoluteTitle: true,
	description: SITE_DESCRIPTION,
	path: "/",
});

// بلوک مجله تزئینی است؛ قطعی وردپرس نباید صفحه‌ی اصلی را خراب کند
async function getLatestPosts(): Promise<Paginate<BlogPostDto> | null> {
	try {
		return await getPostsPage({ page: 1, pageSize: 10 });
	} catch {
		return null;
	}
}

export default async function Home() {
	const [blogPageData, liveLandings] = await Promise.all([getLatestPosts(), getLiveDocLandings()]);

	return (
		<>
			<Header />
			<JsonLd data={buildFaqPage(HOME_FAQS)} />
			<main className="">
				<section className="">
					{/* هیرو عمداً بدون Reveal است: محتوای بالای صفحه (عنصر LCP) نباید تا hydration با opacity صفر بماند */}
					<div className="relative overflow-hidden h-[400px] lg:!h-[600px] 2xl:!h-[650px] peyda max-lg:!mt-[70px]">
						<Image src="/images/herobg.webp" alt="" fill priority sizes="100vw" className="object-cover object-top" />
						<div className="container flex items-start justify-center flex-col h-full gap-8 max-lg:!gap-6 max-lg:!px-4 relative -top-10">
							<p className="text-neutral-200">
								{HOME_HERO.tagline} <span className="text-secondary font-semibold">{HOME_HERO.taglineHighlight}</span>
							</p>
							<h1 className="text-neutral-200 text-5xl font-semibold max-lg:!text-2xl">{HOME_HERO.h1}</h1>
							<TabanButton
								variant="contained"
								isLink
								href="/new-order"
								data-track-event="start_order"
								data-track-source="home_hero"
								className="font-semibold group !border-none rounded flex items-center gap-2 !bg-secondary"
							>
								<IconTranslate stroke="black" strokeWidth={0} className=" fill-white duration-200" />
								شروع ترجمه آنلاین
							</TabanButton>
						</div>
					</div>
				</section>
				<section>
					<div className="container lg:px-[10%] max-lg:!px-4 relative">
						<HeroOrderStart />
					</div>
				</section>
				<div className="h-24 max-lg:!h-16"></div>
				<section>
					<div className="bg-[url('/images/servicebg.webp')] !bg-cover !bg-center">
						{/* متن و تیتر H2 اول در DOM می‌آید تا H3 کارت‌ها پیش از تیتر بخش نیایند؛ جای بصری با flex-row-reverse حفظ شده */}
						<div className="container  flex flex-row-reverse items-center lg:!gap-32 max-lg:!gap-8 h-full max-lg:!flex-col">
							<div className="w-full flex">
								<Reveal className="flex flex-col gap-4 relative">
									<div className="absolute -right-52 lg:!top-[calc(50%-30px)] max-lg:!top-0 flex">
										<Image src="/images/home/serviceShow.png" alt="" className="w-36 " width={114} height={80} />
									</div>

									<h2 className="text-3xl font-medium peyda  max-lg:!px-4 max-lg:!text-2xl">
										{HOME_SERVICES.title} <span className="text-secondary font-semibold">{HOME_SERVICES.titleHighlight}</span>{" "}
										{HOME_SERVICES.titleSuffix}
									</h2>
									<p className="lg:!pl-32  max-lg:!px-4 leading-8">{HOME_SERVICES.intro}</p>
									<div className="flex  max-lg:!px-4">
										<TabanButton isLink href="/about-us" className="">
											با ما بیشتر آشنا شوید
										</TabanButton>
									</div>
								</Reveal>
							</div>
							<div className="w-full  max-lg:!px-4">
								<div className="flex gap-6 max-lg:!flex-col max-lg:!gap-4">
									{[HOME_SERVICES.cards.slice(0, 2), HOME_SERVICES.cards.slice(2, 4)].map((column, columnIndex) => (
										<div key={columnIndex} className={`flex flex-col gap-4 ${columnIndex === 0 ? "lg:pt-20" : ""}`}>
											{column.map((card) => (
												<div
													key={card.title}
													className="group rounded-2xl border border-neutral-400 p-4 w-56 max-lg:!w-full bg-white duration-200 hover:bg-primary"
												>
													<Image src="/images/home/iconService1.svg" height={38} width={38} alt="" />
													<h3 className="peyda font-semibold text-neutral-600 mt-4 text-lg duration-200 group-hover:text-neutral-100">
														{card.title}
													</h3>
													<p className="text-neutral-500 mt-1 duration-200 group-hover:text-neutral-300">{card.desc}</p>
												</div>
											))}
										</div>
									))}
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
						<div className="flex gap-16 items-center relative z-[2] max-lg:!flex-col max-lg:!px-4">
							<Reveal className="w-full flex flex-col gap-4">
								<h2 className="text-4xl peyda font-semibold max-lg:!text-2.5xl">
									<span className="text-secondary">ویژگی‌های</span> پنل مشتریان
								</h2>
								<p className="lg:pl-32 leading-7">{HOME_CUSTOMER_PANEL.intro}</p>
								<TabanButton isLink href="/auth" className="">
									همین حالا عضو شوید
								</TabanButton>
							</Reveal>
							<div className="w-full flex flex-col gap-8">
								{HOME_CUSTOMER_PANEL.features.map((feature, index) => (
									<div key={feature.title} className="flex items-start gap-4">
										<div className="h-[50px] w-[50px] flex items-center justify-center rounded-full bg-primary relative shrink-0">
											{index < HOME_CUSTOMER_PANEL.features.length - 1 && (
												<div className="w-[1px] bg-neutral-300 top-[calc(100%+8px)] right-6 h-[80px] absolute"></div>
											)}
											<Image src={feature.icon} width={28} height={28} alt="" />
										</div>
										<div className="flex flex-col gap-1">
											<h3 className="peyda font-semibold text-lg pt-2.5">{feature.title}</h3>
											<p className="text-neutral-500 max-w-[353px]">{feature.desc}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
				<div className="h-24"></div>
				<section className="bg-white border-y border-neutral-100 py-16">
					<div className="container max-lg:!px-4">
						<Reveal className="flex flex-col items-center text-center gap-3 mb-12">
							<h2 className="text-2xl lg:text-3xl font-bold peyda text-primary">
								ثبت سفارش تنها در <span className="text-secondary">۴ گام</span>
							</h2>
							<p className="text-neutral-500 text-sm">از انتخاب مدرک تا تحویل، همه‌چیز ساده و آنلاین</p>
						</Reveal>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
							{steps.map((step, i) => (
								<Reveal key={step.title} delay={i * 0.1} className="relative flex flex-col items-center text-center gap-3">
									{i < steps.length - 1 && (
										<div className="hidden lg:block absolute top-7 left-[-50%] w-full h-px border-t-2 border-dashed border-neutral-200" />
									)}
									<div className="relative z-[2] w-14 h-14 rounded-full bg-gradient-to-bl from-primary to-primary/80 text-white flex items-center justify-center text-xl font-bold peyda shadow-lg">
										{i + 1}
									</div>
									<h3 className="font-semibold peyda text-neutral-800">{step.title}</h3>
									<p className="text-sm text-neutral-500 leading-7 max-w-[200px]">{step.desc}</p>
								</Reveal>
							))}
						</div>

						<div className="flex justify-center mt-12">
							<TabanButton
								variant="contained"
								isLink
								href="/new-order"
								data-track-event="start_order"
								data-track-source="home_steps"
								className="font-semibold !border-none rounded-xl flex items-center gap-2 !bg-secondary"
							>
								<IconTranslate stroke="black" strokeWidth={0} className="fill-white" />
								همین حالا سفارش بده
							</TabanButton>
						</div>
					</div>
				</section>
				{liveLandings.length > 0 && (
					<>
						<div className="h-24"></div>
						<section className="container max-lg:!px-4">
							<div className="flex flex-col items-center text-center gap-3 mb-10">
								<h2 className="text-2xl lg:text-3xl font-bold peyda text-primary">پرتقاضاترین مدارک برای ترجمه رسمی</h2>
							</div>
							<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{liveLandings.map((landing) => (
									<li key={landing.slug}>
										<Link
											href={docLandingPath(landing.slug)}
											className="h-full flex items-center gap-3 bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg duration-200 peyda font-semibold text-neutral-800"
										>
											<IconTranslate strokeWidth={0} className="fill-secondary w-6 h-6 shrink-0" />
											{landing.keyword}
										</Link>
									</li>
								))}
							</ul>
						</section>
					</>
				)}
				<div className="h-24"></div>
				<section>
					<div className="bg-[url('/images/home/countrybg-1920.webp')] !bg-cover !bg-center py-10 w-full relative lg:bg-fixed">
						<div className="absolute z-[1] w-8/12 h-full right-0 top-0 bg-gradient-to-l from-primary to-primary/0"></div>
						<div className="container flex items-center gap-4 relative z-[2] max-lg:!flex-col">
							<Reveal className="w-full flex flex-col gap-4 max-lg:!px-4">
								<h2 className="peyda text-neutral-300 text-3xl font-medium max-lg:!text-2xl">ثبت سفارش آنلاین ترجمه از سراسر کشور</h2>
								<div className="flex items-center gap-1 text-neutral-300 mt-2">
									<Image src="/images/home/iconCountryBox1.svg" height={27} width={27} alt="" />
									سفارش آنلاین ترجمه
								</div>
								<div className="flex items-center gap-1 text-neutral-300">
									<Image src="/images/home/iconCountryBox2.svg" height={27} width={27} alt="" />
									ارسال مدارک از و به سراسر کشور
								</div>
								<TabanButton
									variant="contained"
									isLink
									href="/new-order"
									data-track-event="start_order"
									data-track-source="home_country"
									className="font-semibold group !border-none rounded flex items-center gap-2 !bg-secondary mt-6"
								>
									<IconTranslate stroke="black" strokeWidth={0} className=" fill-white duration-200" />
									شروع ترجمه آنلاین
								</TabanButton>
							</Reveal>
							<div className="w-full max-lg:!hidden">
								<Image
									src="/images/home/iran-map.svg"
									alt="ثبت سفارش ترجمه رسمی از همه‌ی استان‌های ایران"
									width={632}
									height={470}
									loading="lazy"
									className="w-[632px] h-[470px]"
								/>
							</div>
						</div>
					</div>
				</section>
				<div className="h-32"></div>
				<section>
					<div className="container">
						<Reveal className="flex flex-col items-center gap-14">
							<Image src="/images/home/b2bPannel.png" width={360} height={290} alt="پنل مشتریان سازمانی رسمی‌یاب" />
							<div className="flex flex-col items-center gap-4">
								<h2 className="text-3xl font-medium peyda">
									پنل مشتریان سازمانی <span className="text-secondary font-semibold">رسمی‌یاب</span>
								</h2>
								<p className="lg:!w-8/12 max-lg:!px-4 leading-7 text-center">{HOME_ENTERPRISE}</p>
								<TabanButton isLink href="/auth" className="">
									همین حالا عضو شوید
								</TabanButton>
							</div>
						</Reveal>
					</div>
				</section>
				{comments.length > 0 && (
					<>
						<div className="h-32"></div>
						<section>
							<div className="h-[450px] bg-gradient-to-l from-[#040e27] to-primary relative">
								<div className="w-full absolute h-full flex items-center justify-center z-[1]">
									<Image src="/images/home/commentbg.webp" height={418} width={790} loading="lazy" className="!h-full w-auto mx-auto" alt="" />
								</div>
								<div className="container z-[2] py-10">
									<div className="flex flex-col items-center gap-3">
										<h2 className="peyda font-semibold text-2xl text-neutral-200">نظر همراهان رسمی‌یاب</h2>
										<p className="text text-neutral-200">کاربران رسمی‌یاب در مورد تجربه خود از ترجمه های ما گفته اند</p>
										<div className="lg:!w-[1018px] max-lg:!w-full max-lg:!px-4">
											<CommentsSlider comments={comments} />
										</div>
									</div>
								</div>
							</div>
						</section>
					</>
				)}
				<div className="h-32"></div>
				<section className="container max-lg:!px-4 py-12">
					<Reveal className="flex flex-col items-center text-center gap-3 mb-10">
						<div className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
							<span className="h-px w-8 bg-secondary" />
							چرا رسمی‌یاب؟
							<span className="h-px w-8 bg-secondary" />
						</div>
						<h2 className="text-2xl lg:text-3xl font-bold peyda text-primary">یک تجربه‌ی متفاوت از ترجمه رسمی</h2>
					</Reveal>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
						{services.map((s, i) => (
							<Reveal key={s.title} delay={i * 0.08}>
								<div className="group bg-white border border-neutral-200 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 duration-200 flex flex-col gap-3">
									<div className="w-14 h-14 rounded-2xl bg-primary/5 group-hover:bg-primary group-hover:[&_svg]:stroke-white flex items-center justify-center duration-200">
										{s.icon}
									</div>
									<h3 className="font-semibold peyda text-lg text-neutral-800">{s.title}</h3>
									<p className="text-sm text-neutral-500 leading-7">{s.desc}</p>
								</div>
							</Reveal>
						))}
					</div>
				</section>
				<div className="h-24"></div>
				<section className="container max-lg:!px-4">
					<div className="flex flex-col items-center text-center gap-3 mb-10">
						<h2 className="text-2xl lg:text-3xl font-bold peyda text-primary">سوالات متداول ترجمه رسمی</h2>
					</div>
					<div className="max-w-4xl mx-auto">
						<Faq items={HOME_FAQS} />
					</div>
				</section>
				<div className="h-32"></div>
				<section>
					<div className="container">
						<Reveal className="flex items-center justify-between max-lg:!flex-col gap-4">
							<div className="flex items-center gap-2 peyda font-semibold">
								<h2 className="text-primary  text-lg">مجله رسمی‌یاب</h2>
								<div className="h-10 w-0.5 bg-secondary"></div>
								<div className="text-secondary  text-lg">جدیدترین نکات و مقالات</div>
							</div>
							<TabanButton isLink href="/blog" className="">
								وبلاگ رسمی‌یاب
							</TabanButton>
						</Reveal>
						<div className="w-full mt-8">{!blogPageData ? null : <BlogPreview posts={blogPageData?.elements} />}</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
