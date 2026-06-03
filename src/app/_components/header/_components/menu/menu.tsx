"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconArrow, IconCircleUser, IconDocument, IconHome, IconInfo, IconSupport24, IconTranslate } from "@/app/_components/icon/icons";
import { useProfiletore } from "@/stores/profile";
import { menuItems } from "../../_constant/menuItems";
import { MenuPopupProps } from "./menu.type";

const iconFor = (href: string) => {
	if (href === "/") return IconHome;
	if (href.startsWith("/blog")) return IconDocument;
	if (href.startsWith("/new-order")) return IconTranslate;
	if (href.startsWith("/about")) return IconInfo;
	if (href.startsWith("/contact")) return IconSupport24;
	return IconArrow;
};

export const MenuPopup: React.FC<MenuPopupProps> = ({ open, setOpen }) => {
	const [hidden, setHidden] = useState<boolean>(true);
	const pathname = usePathname();
	const profile = useProfiletore((state) => state.profile);

	useEffect(() => {
		if (!open) {
			const t = setTimeout(() => setHidden(true), 350);
			return () => clearTimeout(t);
		}
		setHidden(false);
	}, [open]);

	const close = () => setOpen(false);

	if (hidden) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: open ? 1 : 0 }}
			transition={{ duration: 0.25 }}
			className="w-full h-screen bg-black/50 backdrop-blur-sm fixed z-[110] top-0 left-0"
		>
			<div onClick={close} className="w-full h-full absolute z-[110] top-0 left-0" />

			<motion.div
				onClick={(e) => e.stopPropagation()}
				initial={{ x: "100%" }}
				animate={{ x: open ? "0%" : "100%" }}
				transition={{ type: "spring", damping: 40, stiffness: 300 }}
				className="bg-white w-[75%] max-w-sm fixed right-0 top-0 z-[111] h-full flex flex-col shadow-2xl"
			>
				{/* User / auth card */}
				<div className="px-5 pt-4">
					{profile ? (
						<Link
							href="/profile"
							onClick={close}
							className="flex items-center gap-3 bg-gradient-to-l from-primary to-primary/85 text-white rounded-2xl p-4 duration-200 active:scale-[0.98]"
						>
							<span className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
								<IconCircleUser className="stroke-white w-6 h-6" />
							</span>
							<span className="flex flex-col min-w-0">
								<span className="font-semibold peyda truncate">
									{profile.fullName?.trim() || "کاربر رسمی‌یاب"}
								</span>
								<span className="text-xs text-white/70">مشاهده پیشخوان</span>
							</span>
							<IconArrow className="-rotate-90 fill-white/80 mr-auto" width={20} height={20} strokeWidth={0} />
						</Link>
					) : (
						<Link
							href="/auth"
							onClick={close}
							className="flex items-center justify-center gap-2 bg-secondary hover:bg-suppliment text-white rounded-2xl p-4 font-semibold duration-200 active:scale-[0.98]"
						>
							<IconCircleUser className="stroke-white w-5 h-5" />
							ورود / ثبت‌نام
						</Link>
					)}
				</div>

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto px-3 py-4">
					<ul className="flex flex-col gap-1">
						{menuItems.map((item) => {
							const Icon = iconFor(item.href);
							const isActive =
								item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace(/\/$/, ""));
							return (
								<li key={item.href}>
									<Link
										href={item.href}
										onClick={close}
										className={`group flex items-center gap-3 px-3 py-3 rounded-xl duration-200 ${
											isActive
												? "bg-primary/10 text-primary"
												: "text-neutral-600 hover:bg-neutral-100"
										}`}
									>
										<span
											className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 duration-200 ${
												isActive
													? "bg-primary/15"
													: "bg-neutral-100 group-hover:bg-white"
											}`}
										>
											<Icon
												strokeWidth={1.5}
												className={`w-5 h-5 ${isActive ? "stroke-primary" : "stroke-neutral-500"}`}
											/>
										</span>
										<span className="text-[15px] font-medium">{item.title}</span>
										<IconArrow
											className={`mr-auto -rotate-90 ${isActive ? "fill-primary" : "fill-neutral-300"}`}
											width={18}
											height={18}
											strokeWidth={0}
										/>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* CTA footer */}
				<div className="px-5 py-4 border-t border-neutral-100">
					<Link
						href="/new-order"
						onClick={close}
						className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl py-3.5 font-semibold duration-200 active:scale-[0.98] shadow-sm"
					>
						<IconTranslate strokeWidth={0} className="fill-white w-5 h-5" />
						سفارش ترجمه آنلاین
					</Link>
				</div>
			</motion.div>
		</motion.div>
	);
};
