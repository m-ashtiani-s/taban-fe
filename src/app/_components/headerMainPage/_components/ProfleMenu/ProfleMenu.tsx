import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconCart, IconLogout, IconUser } from "@/app/_components/icon/icons";
import { API_URL } from "@/config/global";
import { readData } from "@/core/http-service/http-service";
import { useCartStore } from "@/stores/cart";
import { useProfiletore } from "@/stores/profile";
import { Profile } from "@/types/profile.type";
import { Res } from "@/types/responseType";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";

export default function ProfleMenu({setLogoutOpen}:{setLogoutOpen:Dispatch<SetStateAction<boolean>>}) {

	

	return (
		<div className="flex flex-col">
			
			<Link href="/profile" className=" flex items-center gap-2 hover:bg-primary/10 duration-200 rounded-lg">
				<span className="px-2">
					<IconUser />
				</span>
				<span className="py-3 border-b border-b-neutral-200 w-full">حساب کاربری</span>
			</Link>
			<Link href="/profile" className=" flex items-center gap-2 hover:bg-primary/10 duration-200 rounded-lg">
				<span className="px-2">
					<IconCart strokeWidth={0.2} fill="#404040" stroke="#404040" />
				</span>
				<span className="py-3 border-b border-b-neutral-200 w-full">سفارش ها</span>
			</Link>
			<div onClick={()=>setLogoutOpen(true)} className=" flex items-center gap-2 hover:bg-primary/10 duration-200 rounded-lg cursor-pointer">
				<span className="px-2">
					<IconLogout stroke="#404040" />
				</span>
				<span className="py-3 w-full">خروج از حساب کاربری</span>
			</div>
		</div>
	);
}
