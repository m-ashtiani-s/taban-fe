"use client";

import { AuthGuard } from "@/app/_components/authGuard/authGuard";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		setTimeout(() => {
			if (pathname !== "/auth" && pathname !== "/auth/login") {
				router.push("/auth");
			}
		}, 500);
	}, []);
	return (
		<div className="flex h-screen lg:!bg-[url('/images/auth/logobg.svg')] bg-conatin !bg-center bg-no-repeat">
			<div className="w-full lg:!flex items-center lg:!justify-center mx-auto">
				<div className={`${pathname === "/auth/sign-up/complete-profile" ? "lg:!w-[800px]" : "lg:!w-[400px]"}  w-full`}>
					<AuthGuard>{children}</AuthGuard>
				</div>
			</div>
		</div>
	);
}
