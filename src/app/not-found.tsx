import { Metadata } from "next";
import { Footer } from "./_components/footer/footer";
import { Header } from "./_components/header/header";
import NotFoundHero from "./_components/notFoundHero/notFoundHero";

export const metadata: Metadata = {
	title: "صفحه پیدا نشد",
	robots: { index: false, follow: true },
};

export default function NotFound() {
	return (
		<>
			<Header />
			<NotFoundHero />
			<Footer />
		</>
	);
}
