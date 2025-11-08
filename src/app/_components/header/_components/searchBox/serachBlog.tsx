"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SerachBlog() {
	const router = useRouter();
	const [value, setValue] = useState<string>("");
	const changeHandler = (e: any) => {
		if (e?.key === "Enter") {
			router.push(`/archive?term=${value}`);
		}
	};

	return (
		<div className="relative">
			<input
				value={value}
				onChange={(e) => setValue(e?.target?.value)}
				onKeyDown={changeHandler}
				name="fullName"
				className=" p-2 absolute w-44 left-0 -top-4 rounded-lg border bg-primary text-white border-neutral-2/40 duration-200 h-9 outline-none focus:border-neutral-3 placeholder:text-sm"
				placeholder="جستجو"
			/>
			<span className=" hidden lg:!block cursor-pointer w-6 absolute -top-2.5 left-2" onClick={()=>!!value && router.push(`/archive?term=${value}`)}>
				<Image src="/images/search.svg" width={22} height={31} alt="search w-6" />
			</span>
		</div>
	);
}
