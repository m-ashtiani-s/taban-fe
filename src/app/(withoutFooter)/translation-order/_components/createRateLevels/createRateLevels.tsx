import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { CreateRateLevelsProps } from "./createRateLevels.type";
import { Fragment } from "react";
const levels = [
	{
		level: 1,
		title: "انتخاب مدرک",
	},
	{
		level: 2,
		title: "انتخاب زبان",
	},
	{
		level: 3,
		title: "موارد خاص ترجمه",
	},
	{
		level: 4,
		title: "تاییدات ترجمه",
	},
	{
		level: 5,
		title: "بررسی استعلام ها",
	},
	{
		level: 6,
		title: "فاکتور نهایی و پرداخت",
	},
];
export default function CreateRateLevels({ activeLevel }: CreateRateLevelsProps) {
	return (
		<div className="flex items-center gap-1 w-full flex-row px-6">
			{levels?.map((it, index) => (
				<Fragment key={it?.title}>
					{index !== 0 && <div className="h-[1px] w-full bg-neutral-300"></div>}
					<div className="flex flex-col gap-2 items-center relative">
						<div
							className={`rounded-full w-6 h-6 border text-primary duration-200 font-medium flex items-center justify-center
                             ${activeLevel > it?.level ? "border-success bg-success text-white" : activeLevel === it?.level ? "border-success text-success !border-2 font-bold !w-8 !h-8" : "border-primary !border-dashed bg-white"}`}
						>
							{convertToPersianNumber(it?.level)}
						</div>
                        <div className={`whitespace-nowrap absolute w-[100px] flex top-8 justify-center -left-[38px] text-sm ${activeLevel > it?.level ? "text-success font-medium" : activeLevel === it?.level ? "!text-lg font-bold top-11 text-success" : ""}`}>{it?.title}</div>
					</div>
				</Fragment>
			))}
		</div>
	);
}
