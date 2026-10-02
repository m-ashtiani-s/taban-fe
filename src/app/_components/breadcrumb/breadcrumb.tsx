import Link from "next/link";
import { BreadcrumbProps } from "./breadcrumb.type";

export default function Breadcrumb({ items, tone = "light" }: BreadcrumbProps) {
	const linkClass = tone === "light" ? "text-white/60 hover:text-secondary" : "text-neutral-500 hover:text-secondary";
	const currentClass = tone === "light" ? "text-white/85" : "text-primary";

	return (
		<nav aria-label="مسیر صفحه">
			<ol className="flex flex-wrap items-center gap-2 text-sm">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					return (
						<li key={item.path} className="flex items-center gap-2">
							{isLast ? (
								<span aria-current="page" className={currentClass}>
									{item.name}
								</span>
							) : (
								<>
									<Link href={item.path} className={`${linkClass} duration-200`}>
										{item.name}
									</Link>
									<span aria-hidden className={tone === "light" ? "text-white/30" : "text-neutral-300"}>
										/
									</span>
								</>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
