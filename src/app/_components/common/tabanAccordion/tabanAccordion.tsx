"use client";
import React, { useState } from "react";
import { TabanAccordionProps } from "./tabanAccordion.type";

const Accordion = ({ title, children, isOpen = true }: TabanAccordionProps) => {
	const [accordionOpen, setAccordionOpen] = useState(false);

	return (
		<div className="">
			<button
				onClick={() => setAccordionOpen(!accordionOpen)}
				className={`flex justify-between border ${accordionOpen ? "text-white bg-primary" : "bg-white text-primary"} border-primary w-full duration-200  py-2 lg:py-3 px-2  rounded-t text-sm lg:text-base pr-4 text-right`}
			>
				<span>{title}</span>
				<svg className={`${accordionOpen ? "fill-white" : "fill-primary"} shrink-0 ml-4 mt-1`} width="16" height="16" xmlns="http://www.w3.org/2000/svg">
					<rect y="7" width="16" height="2" rx="1" className={`transform origin-center transition duration-200 ease-out ${accordionOpen && isOpen && "!rotate-180"}`} />
					<rect y="7" width="16" height="2" rx="1" className={`transform origin-center rotate-90 transition duration-200 ease-out ${accordionOpen && isOpen && "!rotate-180"}`} />
				</svg>
			</button>
			<div className={`grid overflow-hidden transition-all duration-300 ease-in-out  text-sm ${accordionOpen && isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
				<div className="overflow-hidden">{children}</div>
			</div>
		</div>
	);
};

export default Accordion;
