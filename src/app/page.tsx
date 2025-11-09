"use client";

import Image from "next/image";
import TabanButton from "./_components/common/tabanButton/tabanButton";
import { Footer } from "./_components/footer/footer";
import { Header } from "./_components/header/header";
import { IconTranslate } from "./_components/icon/icons";

export default function Home() {
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
							<div className="w-full"></div>
							<div className="w-full">
								<div className="flex flex-col gap-4 relative">
									<div className="absolute -right-52 top-[calc(50%-30px)] flex"><Image src="/images/home/serviceShow.png" alt="" className="w-36 " width={114} height={80} /></div>
									
									<div className="text-3xl font-medium peyda">
										تابان چه <span className="text-secondary font-semibold">خدماتی</span> ارائه
										میدهد؟
									</div>
									<div className="pl-32">
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
										طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
										لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود{" "}
									</div>
									<TabanButton
										isLink
										href="/about-us"
										className=""
									>
										
										با ما بیشتر آشنا شوید
									</TabanButton>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
