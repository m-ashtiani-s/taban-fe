"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useState } from "react";
const loop = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export default function BlogPreview() {
	const [width, setWidth] = useState<number>(0);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setWidth(window.innerWidth);
			window.addEventListener("resize", handleWindowSizeChange);
			return () => {
				window.removeEventListener("resize", handleWindowSizeChange);
			};
		}
	}, []);
	function handleWindowSizeChange() {
		setWidth(window.innerWidth);
	}
	const isMobile = width <= 768;

	return (
		// <Swiper
		// 	navigation={false}
		// 	autoplay={{
		// 		delay: 10000,
		// 	}}
		// 	pagination={false}
		// 	spaceBetween={24}
		// 	modules={[Autoplay]}
		// 	slidesPerView={isMobile ? 1 : 2}
		// 	className="mySwiper custom-swipper"
		// >
		// 	{comments?.map((slide) => (
		// 		<SwiperSlide key={slide?.name}>
		// 			<div className="relative pt-10">
		// 				<div
		// 					style={{ background: `url('${slide?.imageUrl}')` }}
		// 					className="h-[37px] w-[37px] border border-secondary rounded-full !bg-cover !bg-center absolute right-11 top-5"
		// 				></div>
		// 				<div className="bg-[url('/images/home/commentCartbg.svg')] h-[193px] bg-cover bg-no-repeat relative">
		// 					<div className="p-8">
		// 						<div className="flex items-center justify-between">
		// 							<div className="peyda font-semibold text-lg">{slide?.name}</div>
		// 							<div className="flex">
		// 								{Array.from({ length: slide?.point }).map((_, i) => (
		// 									<IconStar
		// 										className="fill-secondary"
		// 										strokeWidth={0}
		// 										width={20}
		// 										height={20}
		// 									/>
		// 								))}
		// 							</div>
		// 						</div>
		// 						<div className="text-neutral-500 mt-4">{slide?.comment}</div>
		// 					</div>
		// 				</div>
		// 			</div>
		// 		</SwiperSlide>
		// 	))}
		// </Swiper>
		"blog preview"
	);
}
