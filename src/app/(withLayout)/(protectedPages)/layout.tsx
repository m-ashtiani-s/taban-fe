import { AuthGuard } from "@/app/_components/authGuard/authGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<AuthGuard>
				{children}
			</AuthGuard>
		</>
	);
}
