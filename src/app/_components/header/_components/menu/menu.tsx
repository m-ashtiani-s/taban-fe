"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

const subroute = [
	{ href: "/", label: "پست مرسوله" },
	{ href: "/پست-داخلی", label: "پست داخلی" },
	{ href: "/پست-درون-شهری-ماهکس", label: "پست درون شهری" },
	{ href: "/پست-بین-شهری-ماهکس", label: "پست بین شهری" },
	{ href: "/پست-بین-المللی", label: "پست بین‌المللی" },
	{ href: "/کارگو", label: "کارگو" },
	{ href: "/پست-هوایی-خارجی", label: "پست هوایی خارجی" },
	{ href: "/پست-سریع-فلش", label: "پست سریع فلش" },
];

export const MenuPopup: React.FC<{ open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ open, setOpen }) => {
	const [hiden, setHiden] = useState<boolean>(false);
	const [accordionOpen, setAccordionOpen] = useState(false);

	const boxMotions = {
		initial: { opacity: 0 },
	};

	const transitionProps = {
		duration: 0.2,
		scale: {
			type: "spring",
			damping: 50,
			stiffness: 400,
		},
	};

	const hide = {
		opacity: 0,
		transitionEnd: {
			display: "none",
		},
	};

	const show = {
		opacity: 1,
		display: "block",
	};

	useEffect(() => {
		if (!open) {
			setTimeout(() => {
				setHiden(!open);
			}, 400);
		} else {
			setTimeout(() => {
				setHiden(!open);
			}, 1);
		}
	}, [open]);

	return (
		<>
			{!hiden && (
				<motion.div
					variants={boxMotions}
					initial="initial"
					animate={!!open ? show : hide}
					transition={transitionProps}
					className="w-full h-screen bg-black/60 fixed z-[100] top-0 left-0 search"
				>
					<div onClick={() => setOpen(false)} className="w-full h-screen absolute z-[100] top-0 left-0 "></div>

					<motion.div
						onClick={(e) => e.preventDefault()}
						initial={{ right: -500 }}
						animate={{ right: 0 }}
						transition={{
							delay: 0.2,
							duration: 0.2,
							scale: {
								type: "spring",
								damping: 50,
								stiffness: 400,
							},
						}}
						className="bg-white p-8 w-7/12 fixed  left-0 top-0 z-[101] pt-6  overflow-auto h-full"
					>
						<span className="absolute top-8 right-8 duration-200 ease-in-out hover:rotate-90 cursor-pointer p-2">
							{/* <IconClose stroke="black" onClick={() => setOpen(false)} className="" width={24} height={24} viewBox="0 0 16 16" /> */}
						</span>
						<div className="container">
							<div className="flex flex-col md:!flex-row max-md:gap-12">
								<div className="w-full">
									<Link href="/" className="">
										<Image width={50} height={56} src="/images/logo2.svg" alt="logo" className="" />
									</Link>
									<ul className="flex pr-0 flex-col text-[15px] gap-3 mt-6">
										<li className="border-b border-b-neutral-2 pb-3 text-neutral-5">
											<Link onClick={() => setOpen(false)} className="duration-200 hover:text-neutral-1" href="/">
												خانه
											</Link>
										</li>
										<li className="border-b border-b-neutral-2 pb-3 text-neutral-5">
											<Link onClick={() => setOpen(false)} className="duration-200 hover:text-neutral-1" href="/intelligent-architect">
												طراح هوشمند
											</Link>
										</li>
										<li className="border-b border-b-neutral-2 pb-3 text-neutral-5">
											<Link onClick={() => setOpen(false)} className="duration-200 hover:text-neutral-1" href="#">
												فروشگاه
											</Link>
										</li>
										<li className="border-b border-b-neutral-2 pb-3 text-neutral-5">
											<Link onClick={() => setOpen(false)} className="duration-200 hover:text-neutral-1" href="#">
												مجله معمار
											</Link>
										</li>
										<li className="border-b border-b-neutral-2 pb-3 text-neutral-5">
											<Link onClick={() => setOpen(false)} className="duration-200 hover:text-neutral-1" href="#">
												درباره ما
											</Link>
										</li>
										<li className="border-b border-b-neutral-2 pb-3 text-neutral-5">
											<Link onClick={() => setOpen(false)} className="duration-200 hover:text-neutral-1" href="#">
												تماس با ما
											</Link>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</>
	);
};
