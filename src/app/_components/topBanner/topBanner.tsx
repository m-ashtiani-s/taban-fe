import { getTopBanner } from "@/server/wordpress";

// سمت سرور رندر می‌شود تا بنر و جابه‌جایی هدر از همان HTML اولیه حاضر باشند (بدون CLS بعد از hydration)
export default async function TopBanner() {
	const banner = await getTopBanner();
	if (!banner) return null;

	const image = <img src={banner.image} alt={banner.alt} width={banner.width ?? undefined} height={banner.height ?? undefined} className="w-full h-[72px] object-cover" />;

	return (
		<>
			<style>{":root{--top-banner-height:72px}"}</style>
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
