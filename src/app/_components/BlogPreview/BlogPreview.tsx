"use client";

import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { IconArrowLine, IconCalendar } from "../icon/icons";
import TabanButton from "../common/tabanButton/tabanButton";
const loop = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export default function BlogPreview() {

	return (
		<div className="flex gap-4 justify-center">
			<div className="bg-white w-full p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer group hover:!border-primary border border-primary/0 duration-400">
				<div className="h-[216px] rounded-lg w-full overflow-hidden relative">
					<div className="absolute inset-0 transition-transform duration-500 group-hover:rotate-2 group-hover:scale-110">
						<img src="/images/blog/1.webp" alt="blog" className="w-full h-full object-cover rounded-lg" />
					</div>
				</div>
				<div className="font-bold text-xl mt-4">بررسی علم معماری در آثار تاریخی</div>
				<div className="flex justify-between items-center mt-8">
					<div className="flex gap-1 items-center text-neutral-500 text-sm">
						<IconCalendar width={18} height={18} />
						{convertToPersianNumber("3 مهر 1404")}
					</div>
					<div className="flex">
						<TabanButton className="!px-2" variant="text">بیشتر بخوانید
							<IconArrowLine />
						</TabanButton>
					</div>
				</div>
			</div>
			<div className="bg-white w-full p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer group hover:!border-primary border border-primary/0 duration-400">
				<div className="h-[216px] rounded-lg w-full overflow-hidden relative">
					<div className="absolute inset-0 transition-transform duration-500 group-hover:rotate-2 group-hover:scale-110">
						<img src="/images/blog/2.jpg" alt="blog" className="w-full h-full object-cover rounded-lg" />
					</div>
				</div>
				<div className="font-bold text-xl mt-4">بررسی علم معماری در آثار تاریخی</div>
				<div className="flex justify-between items-center mt-8">
					<div className="flex gap-1 items-center text-neutral-500 text-sm">
						<IconCalendar width={18} height={18} />
						{convertToPersianNumber("3 مهر 1404")}
					</div>
					<div className="flex">
						<TabanButton className="!px-2" variant="text">بیشتر بخوانید
							<IconArrowLine />
						</TabanButton>
					</div>
				</div>
			</div>
			<div className="bg-white w-full p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer group hover:!border-primary border border-primary/0 duration-400">
				<div className="h-[216px] rounded-lg w-full overflow-hidden relative">
					<div className="absolute inset-0 transition-transform duration-500 group-hover:rotate-2 group-hover:scale-110">
						<img src="/images/blog/3.webp" alt="blog" className="w-full h-full object-cover rounded-lg" />
					</div>
				</div>
				<div className="font-bold text-xl mt-4">بررسی علم معماری در آثار تاریخی</div>
				<div className="flex justify-between items-center mt-8">
					<div className="flex gap-1 items-center text-neutral-500 text-sm">
						<IconCalendar width={18} height={18} />
						{convertToPersianNumber("3 مهر 1404")}
					</div>
					<div className="flex">
						<TabanButton className="!px-2" variant="text">بیشتر بخوانید
							<IconArrowLine />
						</TabanButton>
					</div>
				</div>
			</div>

		</div>
	);
}
