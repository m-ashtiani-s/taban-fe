
import classNames from "classnames";
import Link from "next/link";
import { TabanButtonProps } from "./tabanButton.type";
import TabanLoading from "../tabanLoading.tsx/tabanLoading";

export default function TabanButton({
	variant="contained",
	isOutline = false,
	isLoading = false,
	loadingType = "spinner",
	loadingText = "در حال انجام ...",
	type = "button",
	isLink = false,
	icon,
	href = "",
	target = "_self",
	animatedIcon = false,
	children,
	className,
	isEn = false,
	...rest
}: TabanButtonProps) {
	const classes = classNames(
		"btn",
		className,
		{ "btn-outline": isOutline },
		{ "pointer-events-none": isLoading },
		{ "btn-link": isLink },
		{ "animated-icon": animatedIcon },
		{ [`btn-${variant}`]: variant }
	);
	return (
		<>
			{isLink && !!href ? (
				<Link target={target} href={href} className={classes}>
					{!!icon && !isEn && icon}
					{!!isLoading && <TabanLoading color="#a1a1a1" size={24} />}

					{!!isLoading ? loadingText : children}
					{!!icon && isEn && icon}
				</Link>
			) : (
				<button {...rest} type={type} disabled={rest.disabled || !!isLoading} className={classes}>
					{!!icon && !isEn && icon}
					{!!isLoading && <TabanLoading  color="#a1a1a1" className="[&_svg]:!fill-on-surface/40 [&_svg>path:nth-child(1)]:!fill-on-surface/10 relative top-[3px]" size={24} />}

					{!!isLoading ? loadingText : children}
					{!!icon && isEn && icon}
				</button>
			)}
		</>
	);
}
