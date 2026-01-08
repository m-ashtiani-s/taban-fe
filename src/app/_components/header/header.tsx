"use client";

import Image from "next/image";
import Link from "next/link";
import "./style.scss";
import { Fragment, useEffect, useRef, useState } from "react";
import { MenuPopup } from "./_components/menu/menu";
import TabanButton from "../common/tabanButton/tabanButton";
import ProfleMenu from "./_components/ProfleMenu/ProfleMenu";
import { IconArrow, IconCart, IconCircleUser, IconTranslate, IconUser } from "../icon/icons";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { useProfiletore } from "@/stores/profile";
import { useCartStore } from "@/stores/cart";
import TabanModal from "../common/tabanModal/tabanModal";
import { menuItems } from "./_constant/menuItems";
import { MenuItem } from "@/types/menuItem.type";

function HeaderMenu({ children, number }: { children: MenuItem[]; number: number }) {
	return (
		<span className={`sub-wrap${number} absolute top-0 right-full duration-200 p-3`}>
			<span className="flex flex-col bg-white p-2 rounded-lg">
				{children?.map((child) => (
					<div
						key={child?.title}
						className={`relative !text-sm sub-group${number + 1} py-2 flex items-center justify-between gap-4 whitespace-nowrap text-primary/80 hover:!text-primary bg-neutral-50/0 hover:!bg-neutral-200/80 rounded-lg duration-200`}
					>
						<Link href={child?.href} className="flex gap-8 items-center px-2 w-full justify-between">
							{child?.title}
							{child?.childrens?.length > 0 && (
								<IconArrow className="-rotate-90 fill-primary" height={24} width={24} strokeWidth={0} />
							)}
						</Link>

						{child?.childrens?.length > 0 && (
							<Fragment key={child?.title}>
								<HeaderMenu children={child?.childrens} number={number + 1} />
							</Fragment>
						)}
					</div>
				))}
			</span>
		</span>
	);
}

export const Header = () => {
	const { profile, setProfile } = useProfiletore();
	const [open, setOpen] = useState<boolean>(false);
	const [logoutOpen, setLogoutOpen] = useState<boolean>(false);

	const menuHandler = () => {
		setOpen(true);
	};

	const logoutHandler = async () => {
		await localStorage.removeItem("token");
		setProfile(null);
		setLogoutOpen(false);
	};

	return (
		<>
			<TabanModal onClose={() => {}} open={logoutOpen} setOpen={setLogoutOpen} title="خروج از حساب کابری">
				<div className="">
					آیا برای خروج از حساب کاربری اطمینان دارید؟
					<div className="mt-10 flex justify-end gap-4">
						<TabanButton onClick={() => setLogoutOpen(false)} variant="bordered">
							انصراف
						</TabanButton>
						<TabanButton onClick={logoutHandler}>خروج از حساب</TabanButton>
					</div>
				</div>
			</TabanModal>
			<header
				style={{ background: "#1a3047" }}
				className={`header bg-primary flex flex-col max-lg:!hidden w-full top-0 right-0 rounded-none  fixed duration-300 px-0 lg:!px-6 z-[100] shadow-sm`}
			>
				<div className="container mx-auto flex justify-between items-center py-2">
					<div className="flex gap-8 items-center">
						<Link href="/" className="flex items-center">
							<Image src="/images/logo2White.svg" width={48} height={32} alt="logo" />
						</Link>
						<div className=" gap-3 hidden lg:!flex text-sm peyda">
							{menuItems?.map((it) => (
								<div
									key={it?.title}
									className="group cursor-pointer relative font-medium text-sm duration-200 border-b-2 border-b-primary/0 hover:!border-b-neutral-200 pb-2 mt-2 text-neutral-200 hover:!text-neutral-200"
								>
									<Link href={it?.href} className="flex gap-1 items-center px-2">
										{it?.title}
										{it?.childrens?.length > 0 && (
											<IconArrow
												className="rotate-180 fill-neutral-300"
												height={24}
												width={24}
												strokeWidth={0}
											/>
										)}
									</Link>
									{it?.childrens?.length > 0 && (
										<span
											className={`absolute top-full right-0 p-1 invisible group-hover:!visible opacity-0 group-hover:!opacity-100 duration-200`}
										>
											<span className="flex flex-col bg-white p-2 rounded-lg">
												{it?.childrens?.map((child) => (
													<div
														key={child?.title}
														className="relative sub-group1 py-2 gap-4 whitespace-nowrap text-primary/80 hover:!text-primary bg-neutral-50/0 hover:!bg-neutral-200/80 rounded-lg duration-200"
													>
														<Link
															href={child?.href}
															className="flex gap-8 items-center px-2 w-full justify-between"
														>
															{child?.title}
															{child?.childrens?.length > 0 && (
																<IconArrow
																	className="-rotate-90 fill-primary"
																	height={24}
																	width={24}
																	strokeWidth={0}
																/>
															)}
														</Link>

														{child?.childrens?.length > 0 && (
															<Fragment key={child?.title}>
																<HeaderMenu
																	number={1}
																	children={
																		child?.childrens
																	}
																/>
															</Fragment>
														)}
													</div>
												))}
											</span>
										</span>
									)}
								</div>
							))}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<TabanButton
							variant="contained"
							isLink
							href="/translation-order/translation-item"
							className="!text-neutral-800 font-semibold group !border-none rounded flex items-center gap-2 !bg-white shadow"
						>
							<IconTranslate stroke="black" strokeWidth={0} className=" fill-primary duration-200" />
							سفارش آنلاین
						</TabanButton>
						{!!profile ? (
							<div className="flex items-center gap-4">
								<div className="relative group py-2 flex items-center gap-1 cursor-pointer">
									<TabanButton
										variant="icon"
										isLink
										href="/auth"
										className="!text-neutral-800 font-semibold group !border-none rounded h-10 min-w-10 flex items-center gap-2 !bg-secondary shadow group-hover:!bg-suppliment group-hover:!text-white"
									>
										<IconCircleUser
											stroke="black"
											className="group-hover:!stroke-secondary stroke-white duration-200"
										/>
									</TabanButton>
									<div className="hidden group-hover:!flex pt-2 absolute top-full left-0">
										<div className="w-64 bg-white border-neutral-300 shadow-sm border p-2 rounded">
											<ProfleMenu setLogoutOpen={setLogoutOpen} />
										</div>
									</div>
								</div>
							</div>
						) : (
							<TabanButton
								variant="icon"
								isLink
								href="/auth"
								className="!text-neutral-800 font-semibold group !border-none rounded h-10 min-w-10 flex items-center gap-2 !bg-secondary shadow hover:!bg-suppliment hover:!text-white"
							>
								<IconCircleUser
									stroke="black"
									className="group-hover:!stroke-secondary stroke-white duration-200"
								/>
							</TabanButton>
						)}
					</div>
				</div>
			</header>
			<header
				className={`lg:!hidden w-full top-0 right-0 rounded-none border-white border-b-neutral-200 fixed duration-300  z-[100] bg-white shadow-sm border py-1`}
			>
				<MenuPopup open={open} setOpen={setOpen} />
				<div className="w-full ">
					<div className="flex w-full">
						<div className="flex lg:!hidden justify-between px-6 items-center w-full">
							<span onClick={menuHandler} className="cursor-pointer lg:!hidden">
								<Image src="/images/menu.svg" alt="menu" width={24} height={24} />
							</span>
							<Link href="/" className=" relative">
								<Image width={90} height={56} src="/images/logo2.svg" alt="logo" className="max-lg:!w-14 py-2" />
							</Link>
						</div>
					</div>
				</div>
			</header>
		</>
	);
};
