"use client";
import Image from "next/image";
import Link from "next/link";
import { IconArrow, IconInstagram, IconTelegram, IconWhatsapp } from "../icon/icons";

export const Footer = () => {
	return (
		<>
			<footer className="pt-20 ">
				<div className="bg-primary relative">
					<img src="/images/footer/pattern1.svg" alt="" className="w-[420px] absolute right-0 top-0" />
					<img src="/images/footer/pattern2.svg" alt="" className="w-[420px] absolute left-0 top-0" />
					<div className="container py-12">
						<div className="flex flex-col gap-6 w-full items-center">
							<img src="/images/logoWhite.svg" alt="" className="w-36" />
							<div className="flex flex-col w-full items-center gap-3">
								<div className="peyda text-neutral-200 font-medium text-2xl">
									درباره دارالترجمه رسمی‌یاب بخوانید
								</div>
								<div className="w-full px-16 text-neutral-200 text-center leading-8">
									لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک
									است. چاپگرهایی و متون بلکه روزنامه و مجله در ستون و سطر آنچنان که با هدف بهبود ابزارهای
									کاربردی می‌باشد.لورم ایپسوم متن ساختگی با تولید سادگی نامفه وم از صنعت چاپ و با استفاده
									از طراحان گرافیک است. چاپگرهایی و متونوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
									چاپگرهایی و متون بلکه روزنامه و مجله در ستون و سطر آنچنان که با هدف بهبود ابزارهای
									کاربردی می‌باشد.
								</div>
							</div>
						</div>
						<div className="flex items-center justify-between mt-6">
							<div className="flex gap-2 text-secondary font-medium">
								<Link href="/" className="border-b border-b-secondary/0 hover:!border-b-secondary pb-1 px-6">
									خانه
								</Link>
								<Link
									href="/rules"
									className="border-b border-b-secondary/0 hover:!border-b-secondary pb-1 px-6"
								>
									قوانین و مقررات رسمی‌یاب
								</Link>
								<Link
									href="/translate-order"
									className="border-b border-b-secondary/0 hover:!border-b-secondary pb-1 px-6"
								>
									ثبت سفارش ترجمه
								</Link>
								<Link
									href="/contact-us"
									className="border-b border-b-secondary/0 hover:!border-b-secondary pb-1 px-6"
								>
									تماس با ما
								</Link>
								<Link
									href="/profile"
									className="border-b border-b-secondary/0 hover:!border-b-secondary pb-1 px-6"
								>
									حساب کاربری
								</Link>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-24 w-24 bg-white rounded-2xl p-2 flex items-center justify-center">
									<img src="/images/footer/etemad.png" alt="" className="h-full" />
								</div>
								<div className="h-24 w-24 bg-white rounded-2xl p-2 flex items-center justify-center">
									<img src="/images/footer/zarin.png" alt="" className="h-full" />
								</div>
							</div>
						</div>
					</div>
					<div className="container border-t border-t-suppliment-full">
						<div className=" bg-primary rounded-t-3xl py-4 flex items-center justify-between text-neutral-200">
							<div className="w-full text-right text-sm">
								تمامی حقوق مادی و معنوی این وبسایت متعلق به دارالترجمه رسمی رسمی‌یاب میباشد.
							</div>
							<div className="w-full flex items-center gap-2 justify-end">
								<Link
									href="/"
									className="bg-secondary h-10 w-10 rounded-tl-[8px] rounded-tr-[16px] rounded-br-[8px] rounded-bl-[16px] flex items-center justify-center"
								>
									<IconInstagram viewBox="0 0 32 32" className="stroke-neutral-200 fill-neutral-200" strokeWidth={1} width={28} height={28}/>
								</Link>
								<Link
									href="/"
									className="bg-secondary h-10 w-10 rounded-tl-[8px] rounded-tr-[16px] rounded-br-[8px] rounded-bl-[16px] flex items-center justify-center"
								>
									<IconTelegram viewBox="0 0 192 192" className="stroke-neutral-200" strokeWidth={18} width={28} height={28}/>
								</Link>
								<Link
									href="/"
									className="bg-secondary h-10 w-10 rounded-tl-[8px] rounded-tr-[16px] rounded-br-[8px] rounded-bl-[16px] flex items-center justify-center"
								>
									<IconWhatsapp className="fill-neutral-200" strokeWidth={0.8} width={24} height={24}/>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
};
