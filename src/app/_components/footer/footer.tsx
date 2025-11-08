"use client";
import Image from "next/image";
import Link from "next/link";
import { IconArrow, IconInstagram } from "../icon/icons";

export const Footer = () => {
	return (
		<>
			<footer className="pt-20">
				<div className="bg-secondary  rounded-t-[32px]">
					<div className="container py-16">
						<div className="flex justify-between">
							<div className="flex w-8/12 items-center">
								<div className="pl-8 border-l border-l-neutral-100 py-2">
									<Image
										src={`/images/logoArchpinWhite.svg`}
										width={200}
										height={100}
										alt=""
										className="min-w-[200px]"
									/>
								</div>
								<div className="px-4 text-neutral-100 font-light">
									طراحان سایت هنگام طراحی قالب سایت معمولا با این موضوع رو برو هستند که محتوای اصلی صفحات
									آماده نیست. در نتیجه طرح کلی دید درستی به کار فرما نمیدهد. اگر طراح
								</div>
							</div>
							<div className="w-4/12">
								<div className="flex justify-end gap-2">
									<Link
										href="/"
										className="bg-primary/10 p-1 rounded-md border border-primary hover:shadow hover:rounded-xl shadow-primary duration-200"
									>
										<IconInstagram
											className=" duration-200 fill-primary"
											strokeWidth={0}
											width={36}
											height={36}
											viewBox="0 0 32 32"
										/>
									</Link>
									<Link
										href="/"
										className="bg-primary/10 p-1 rounded-md border border-primary hover:shadow hover:rounded-xl shadow-primary duration-200"
									>
										<IconInstagram
											className=" duration-200 fill-primary"
											strokeWidth={0}
											width={36}
											height={36}
											viewBox="0 0 32 32"
										/>
									</Link>
									<Link
										href="/"
										className="bg-primary/10 p-1 rounded-md border border-primary hover:shadow hover:rounded-xl shadow-primary duration-200"
									>
										<IconInstagram
											className=" duration-200 fill-primary"
											strokeWidth={0}
											width={36}
											height={36}
											viewBox="0 0 32 32"
										/>
									</Link>
									<Link
										href="/"
										className="bg-primary/10 p-1 rounded-md border border-primary hover:shadow hover:rounded-xl shadow-primary duration-200"
									>
										<IconInstagram
											className=" duration-200 fill-primary"
											strokeWidth={0}
											width={36}
											height={36}
											viewBox="0 0 32 32"
										/>
									</Link>
								</div>
							</div>
						</div>
						<div className="flex gap-2 mt-12">
							<div className="flex flex-col gap-4 w-[30%]">
								<div className="flex gap-2 items-start">
									<div className=" w-10 h-10 flex justify-center items-center rounded-md bg-primary/20">
										<IconInstagram
											className=" duration-200 fill-primary"
											strokeWidth={0}
											width={36}
											height={36}
											viewBox="0 0 32 32"
										/>
									</div>
									<div className="flex flex-col gap-1">
										<div className="text-neutral-400 text-sm morabba font-extralight">
											تلفن پشتیبانی
										</div>
										<div className="text-neutral-300">۰۲۱۹۸۹۸۶۵۰۹</div>
									</div>
								</div>
								<div className="flex gap-2 items-start">
									<div className=" w-10 h-10 flex justify-center items-center rounded-md bg-primary/20">
										<IconInstagram
											className=" duration-200 fill-primary"
											strokeWidth={0}
											width={36}
											height={36}
											viewBox="0 0 32 32"
										/>
									</div>
									<div className="flex flex-col gap-1">
										<div className="text-neutral-400 text-sm morabba font-extralight">
											ارسال ایمیل
										</div>
										<div className="text-neutral-300">info@admin.com</div>
									</div>
								</div>
								<div className="flex gap-2 items-start">
									<div className=" w-10 h-10 flex justify-center items-center rounded-md bg-primary/20">
										<IconInstagram
											className=" duration-200 fill-primary"
											strokeWidth={0}
											width={36}
											height={36}
											viewBox="0 0 32 32"
										/>
									</div>
									<div className="flex flex-col gap-1">
										<div className="text-neutral-400 text-sm morabba font-extralight">آدرس</div>
										<div className="text-neutral-300">تهران شهرک بهار خیابان لاجوردی کوچه خیام</div>
									</div>
								</div>
							</div>
							<div className="w-[20%]">
								<div className="morabba text-primary text-lg">دسترسی سریع</div>
								<div className="flex flex-col mt-3 gap-2">
									<div className="flex group items-center gap-1">
										<IconArrow
											strokeWidth={0}
											className="-rotate-90 relative fill-neutral-400"
											width={16}
											height={16}
										/>
										<Link
											href="/"
											className="group-hover:text-primary relative group-hover:right-1 right-0 duration-200 text-neutral-400"
										>
											خانه
										</Link>
									</div>
									<div className="flex group items-center gap-1">
										<IconArrow
											strokeWidth={0}
											className="-rotate-90 relative fill-neutral-400"
											width={16}
											height={16}
										/>
										<Link
											href="/"
											className="group-hover:text-primary relative group-hover:right-1 right-0 duration-200 text-neutral-400"
										>
											طراح هوشمند
										</Link>
									</div>
									<div className="flex group items-center gap-1">
										<IconArrow
											strokeWidth={0}
											className="-rotate-90 relative fill-neutral-400"
											width={16}
											height={16}
										/>
										<Link
											href="/"
											className="group-hover:text-primary relative group-hover:right-1 right-0 duration-200 text-neutral-400"
										>
											فروشگاه
										</Link>
									</div>
									<div className="flex group items-center gap-1">
										<IconArrow
											strokeWidth={0}
											className="-rotate-90 relative fill-neutral-400"
											width={16}
											height={16}
										/>
										<Link
											href="/"
											className="group-hover:text-primary relative group-hover:right-1 right-0 duration-200 text-neutral-400"
										>
											مجله معمار
										</Link>
									</div>
								</div>
							</div>
							<div className="w-[20%]">
								<div className="morabba text-primary text-lg">دسترسی سریع</div>
								<div className="flex flex-col mt-3 gap-2">
									<div className="flex group items-center gap-1">
										<IconArrow
											strokeWidth={0}
											className="-rotate-90 relative fill-neutral-400"
											width={16}
											height={16}
										/>
										<Link
											href="/"
											className="group-hover:text-primary relative group-hover:right-1 right-0 duration-200 text-neutral-400"
										>
											خانه
										</Link>
									</div>
									<div className="flex group items-center gap-1">
										<IconArrow
											strokeWidth={0}
											className="-rotate-90 relative fill-neutral-400"
											width={16}
											height={16}
										/>
										<Link
											href="/"
											className="group-hover:text-primary relative group-hover:right-1 right-0 duration-200 text-neutral-400"
										>
											طراح هوشمند
										</Link>
									</div>
									<div className="flex group items-center gap-1">
										<IconArrow
											strokeWidth={0}
											className="-rotate-90 relative fill-neutral-400"
											width={16}
											height={16}
										/>
										<Link
											href="/"
											className="group-hover:text-primary relative group-hover:right-1 right-0 duration-200 text-neutral-400"
										>
											فروشگاه
										</Link>
									</div>
									<div className="flex group items-center gap-1">
										<IconArrow
											strokeWidth={0}
											className="-rotate-90 relative fill-neutral-400"
											width={16}
											height={16}
										/>
										<Link
											href="/"
											className="group-hover:text-primary relative group-hover:right-1 right-0 duration-200 text-neutral-400"
										>
											مجله معمار
										</Link>
									</div>
								</div>
							</div>
							<div className="w-[30%]">
								<div className="morabba text-primary text-lg">مجوزها</div>
								<div className="flex mt-3 gap-2">
									<Link href="/">
										<Image src="/images/enamad.png" alt="" width={100} height={100} />
									</Link>
									<Link href="/">
										<Image src="/images/enamad.png" alt="" width={100} height={100} />
									</Link>
									<Link href="/">
										<Image src="/images/enamad.png" alt="" width={100} height={100} />
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="container">
						<div className="w-8/12 mx-auto bg-primary rounded-t-3xl py-2 flex items-center justify-between px-10 text-white">
							<div className="w-full text-right">کلیه حقوق متعلق به جیاواز میباشد.</div>
							<div className="w-[2px] h-7 bg-white"></div>
							<div className="w-full text-left">طراحی و اجرا توسط : آیلی وب</div>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
};
