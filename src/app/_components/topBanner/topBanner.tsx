"use client";

import { useEffect, useState } from "react";
import { TopBanner as TopBannerType } from "@/types/topBanner.type";

const BANNER_HEIGHT_VAR = "--top-banner-height";

export default function TopBanner() {
	const [banner, setBanner] = useState<TopBannerType | null>(null);

	useEffect(() => {
		fetch("/api/wordpress/topbanner")
			.then((res) => (res.ok ? res.json() : null))
			.then((data: TopBannerType | null) => setBanner(data?.image ? data : null))
			.catch(() => {});
	}, []);

	useEffect(() => {
		document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, banner ? "72px" : "0px");
		return () => {
			document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, "0px");
		};
	}, [banner]);

	if (!banner) return null;

	const image = <img src={banner.image} alt={banner.alt} className="w-full h-[72px] object-cover" />;

	return (
		<>
			<div className="fixed top-0 right-0 left-0 w-full h-[72px] z-[120] overflow-hidden bg-primary">
				{banner.link ? (
					<a href={banner.link} className="block w-full h-full">
						{image}
					</a>
				) : (
					image
				)}
			</div>
			<div className="h-[72px]" aria-hidden />
		</>
	);
}
