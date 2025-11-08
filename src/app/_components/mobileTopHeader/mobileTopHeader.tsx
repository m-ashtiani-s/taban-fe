import Link from "next/link";
import { MobileTopHeaderProps } from "./mobileTopHeader.type";
import { IconArrowLine } from "../icon/icons";

export default function MobileTopHeader({ pageName, hasBAck = false, backUrl = "/", backAction, sideComponent = "" }: MobileTopHeaderProps) {
	return (
		<div className={`flex items-center justify-between  min-h-16 bg-white px-4 w-full lg:!hidden`}>
			<div className="flex gap-2 items-center w-fit whitespace-nowrap">
				{hasBAck && backUrl ? (
					<Link href={backUrl}>
						<IconArrowLine width={24} height={24} className="rotate-180" />
					</Link>
				) : !!backAction ? (
					<span onClick={()=>backAction()}>
						<IconArrowLine width={24} height={24} className="rotate-180" />
					</span>
				) : (
					""
				)}
				{pageName}
			</div>
			<div className="w-full">{sideComponent}</div>
		</div>
	);
}
