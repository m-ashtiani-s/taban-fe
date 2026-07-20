import Link from "next/link";
import { HeaderMenuProps } from "./headerMenu.type";
import { IconArrow } from "@/app/_components/icon/icons";
import { Fragment } from "react";

export default function HeaderMenu({ children, number }: HeaderMenuProps) {
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
