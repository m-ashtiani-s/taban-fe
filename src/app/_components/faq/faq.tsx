import Image from "next/image";
import { IconArrow } from "../icon/icons";
import { FaqProps } from "./faq.type";

// details/summary بومی: بدون جاوااسکریپت (آکاردئون NextUI حدود ۹۰KB به باندل صفحه‌ی اصلی اضافه می‌کرد)
// و پاسخ‌ها همیشه در HTML سرور هستند تا با اسکیمای FAQPage یکی باشند
export default function Faq({ items }: FaqProps) {
	return (
		<div className="border border-neutral-300 px-4 rounded-lg w-full">
			{items.map((item) => (
				<details key={item.question} className="group border-b border-neutral-200 last:border-b-0">
					<summary className="flex items-center gap-3 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
						<Image src="/icons/faq.svg" alt="" width={32} height={32} className="shrink-0" />
						<h3 className="font-medium flex-1">{item.question}</h3>
						<IconArrow width={24} height={24} strokeWidth={0} className="shrink-0 fill-neutral-400 rotate-180 group-open:rotate-0 duration-200" />
					</summary>
					<p className="pr-11 pl-10 pb-4 text-neutral-600 leading-8">{item.answer}</p>
				</details>
			))}
		</div>
	);
}
