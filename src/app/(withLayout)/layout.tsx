import { AuthGuard } from "../_components/authGuard/authGuard";
import { Footer } from "../_components/footer/footer";
import { Header } from "../_components/header/header";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			<div className="min-h-[calc(100vh-400px)] pt-[72px]">{children}</div>
			<Footer />
		</>
	);
}
