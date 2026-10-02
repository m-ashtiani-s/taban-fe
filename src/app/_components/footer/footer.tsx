import Link from "next/link";
import { docLandingPath } from "@/config/docLandings";
import { getLiveDocLandings } from "@/server/docLandings";
import SocialLinks from "../socialLinks/socialLinks";
import { FOOTER_INTRO, FOOTER_LINKS } from "./_constants/footerContent";

export const Footer = async () => {
	const liveLandings = await getLiveDocLandings();

	return (
		<footer className="pt-20 pb-[72px] lg:!pb-0">
			<div className="bg-primary relative">
				<img src="/images/footer/pattern1.svg" alt="" className="w-[420px] absolute right-0 top-0" />
				<img src="/images/footer/pattern2.svg" alt="" className="w-[420px] absolute left-0 top-0" />
				<div className="container py-12">
					<div className="flex flex-col gap-6 w-full items-center">
						<img src="/images/logo2White.svg" alt="رسمی‌یاب" width={96} height={108} className="w-24 h-auto max-lg:!w-16" />
						<div className="flex flex-col w-full items-center gap-3">
							<div className="peyda text-neutral-200 font-medium text-2xl">درباره دارالترجمه رسمی‌یاب بخوانید</div>
							<p className="w-full lg:!px-16 max-lg:!px-4 text-neutral-200 text-center leading-8">{FOOTER_INTRO}</p>
						</div>
					</div>
					{liveLandings.length > 0 && (
						<nav aria-label="خدمات پرتقاضا" className="flex flex-col items-center gap-3 mt-8 max-lg:!px-4">
							<div className="peyda text-neutral-200 font-medium">خدمات پرتقاضا</div>
							<ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-300">
								{liveLandings.map((landing) => (
									<li key={landing.slug}>
										<Link href={docLandingPath(landing.slug)} className="hover:text-secondary duration-200">
											{landing.keyword}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					)}
					<div className="flex items-center justify-between mt-6 max-lg:!flex-col max-lg:!gap-4">
						<nav aria-label="پیوندهای فوتر" className="flex gap-2 text-secondary font-medium max-lg:!flex-wrap max-lg:!justify-center">
							{FOOTER_LINKS.map((link) => (
								<Link key={link.href} href={link.href} className="border-b border-b-secondary/0 hover:!border-b-secondary pb-1 px-6">
									{link.title}
								</Link>
							))}
						</nav>
						<div className="flex items-center gap-4">
							<div className="h-24 w-24 bg-white rounded-2xl p-2 flex items-center justify-center">
								<a referrerPolicy="origin" className="h-full w-full" target="_blank" href="https://trustseal.enamad.ir/?id=749842&code=6Vpxo1WdF3PnHM1xu4PfyTJFmPhYZpuU">
									<img
										referrerPolicy="origin"
										className="h-full w-full"
										src="https://trustseal.enamad.ir/logo.aspx?id=749842&Code=6Vpxo1WdF3PnHM1xu4PfyTJFmPhYZpuU"
										alt="نماد اعتماد الکترونیکی (اینماد) رسمی‌یاب"
										loading="lazy"
										style={{ cursor: "pointer" }}
									/>
								</a>
							</div>

							<div className="h-24 w-24 bg-white rounded-2xl p-2 flex items-center justify-center">
								<img src="/images/footer/zarin.png" alt="پرداخت امن با درگاه زرین‌پال" loading="lazy" className="h-full" />
							</div>
						</div>
					</div>
				</div>
				<div className="container border-t border-t-suppliment-full">
					<div className=" bg-primary rounded-t-3xl py-4 flex items-center justify-between text-neutral-200 max-lg:!px-4 max-lg:!flex-col max-lg:!items-center max-lg:!gap-2">
						<div className="w-full text-right text-sm max-lg:!text-center">تمامی حقوق مادی و معنوی این وبسایت متعلق به دارالترجمه رسمی رسمی‌یاب میباشد.</div>
						<div className="w-full flex items-center gap-2 justify-end max-lg:!justify-center">
							<SocialLinks
								tone="light"
								iconSize={28}
								itemClassName="bg-secondary h-10 w-10 rounded-tl-[8px] rounded-tr-[16px] rounded-br-[8px] rounded-bl-[16px] flex items-center justify-center"
							/>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};
