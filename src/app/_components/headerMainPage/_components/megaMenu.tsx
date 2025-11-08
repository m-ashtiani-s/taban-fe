"use client";

import Link from "next/link";
const subroute = [
	{ href: "/", label: "پست مرسوله" },
	{ href: "/پست-داخلی", label: "پست داخلی" },
	{ href: "/پست-درون-شهری-ماهکس", label: "پست درون شهری" },
	{ href: "/پست-بین-شهری-ماهکس", label: "پست بین شهری" },
	{ href: "/پست-بین-المللی", label: "پست بین‌المللی" },
	{ href: "/پست-هوایی-خارجی", label: "پست هوایی خارجی" },
	{ href: "/پست-سریع-فلش", label: "پست سریع فلش" },
];
const MegaMenu: React.FC = () => {
	return (
		<div className="flex flex-col absolute -right-[56px] top-4 w-40 ">
			<ul className="flex items-center gap-8 bg-none flex-col-reverse h-10">
				<img src="/images/triangle.svg" alt="" className="w-6" />
			</ul>
			<ul className="flex items-center gap-5 bg-primary flex-col px-4 py-6 rounded w-full">
				{subroute.map((item) => (
					<li key={item.href} className="w-full">
						<Link className={`border-b-2 pb-2 border-b-primary/0 hover:border-b-white transition flex justify-center !w-full text-center`} href={item.href}>
							{item.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default MegaMenu;
