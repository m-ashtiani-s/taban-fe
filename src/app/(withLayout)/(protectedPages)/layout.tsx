import { AuthGuard } from "@/app/_components/authGuard/authGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<title>رسمی‌یاب | پلتفرمم آنلاین ترجمه رسمی</title>
			<AuthGuard>{children}</AuthGuard>
		</>
	);
}
