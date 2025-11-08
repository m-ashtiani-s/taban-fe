"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";
import CheckProfileError from "./_components/checkProfileError/checkProfileError";
import TabanLoading from "../common/tabanLoading.tsx/tabanLoading";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const router=useRouter()
	const [checkProfileLoading, setCheckProfileLoading] = useState<boolean>(true);
	const [profileLoading, setProfileLoading] = useState<boolean>(true);

	useEffect(() => {
		const init = async () => {
			const token = storage?.get(StorageKey.TOKEN);
			console.log(token)
			if (!token) {
				if (!pathname.includes("/auth")) {
					window.location.href = "/auth";
				}
				setTimeout(() => {
					setCheckProfileLoading(false);
					setProfileLoading(false);
				}, 800);
				return;
			}
			console.log(pathname.includes("/auth"))
			pathname.includes("/auth") && router.push("/")
			setTimeout(() => {
				setCheckProfileLoading(false);
				setProfileLoading(false);
			}, 300);
			// executeGetProfile();
		};

		init();
	}, []);

	if (checkProfileLoading || profileLoading) {
		return (
			<div className="flex justify-center items-center h-screen gap-4">
				<TabanLoading size={36} />
				لطفا منتظر بمانید
			</div>
		);
	}
	// if ((!checkProfileLoading) || (!!profileResult && !profileResult?.success)) {
	// 	return <CheckProfileError executeCheckProfile={executeCheckProfile} />;
	// }

	return <>{children}</>;
};
