"use client";

import { faqs } from "@/constants/faq";
import { Accordion, AccordionItem } from "@nextui-org/react";
import Image from "next/image";

export const Faq = () => {
	return (
		<div className="border border-neutral-300 p-4 rounded-lg w-full">
			<Accordion selectionMode="multiple" showDivider={false}>
				{faqs?.map((it, index) => (
					<AccordionItem
						className="border-b"
						key={index}
						startContent={
							<Image src="icons/faq.svg" alt="faq" width={32} height={32} className="relative -top-0.5" />
						}
						title={<div className="font-medium">{it?.question}</div>}
					>
						<div className="pr-11 pl-10">{it?.question}</div>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
};
