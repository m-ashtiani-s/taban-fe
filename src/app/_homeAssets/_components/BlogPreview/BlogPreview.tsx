"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.scss";
import { useEffect, useState } from "react";
import { BlogPreviewProps } from "./BlogPreview.type";
import BlogPost from "@/app/_components/blogPost/blogPost";

export default function BlogPreview({ posts }: BlogPreviewProps) {
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
		<div className="blogPreview">
			<Swiper
				navigation={false}
				autoplay={{
					delay: 10000,
				}}
				pagination={true}
				spaceBetween={24}
				modules={[Autoplay, Pagination, Navigation]}
				slidesPerView={isMobile ? 1 : 3}
				className="mySwiper2 custom-swipper2 BlogPreview"
			>
				{posts?.map((slide) => (
					<SwiperSlide key={slide?.id}>
						<BlogPost post={slide} />
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
}
