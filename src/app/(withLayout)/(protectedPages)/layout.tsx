import { Metadata } from "next";
import { AuthGuard } from "@/app/_components/authGuard/authGuard";

export const metadata: Metadata = {
	title: "حساب کاربری",
	robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="container">
			<AuthGuard>{children}</AuthGuard>
		</div>
	);
}
