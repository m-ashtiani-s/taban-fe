"use client";

import { useState } from "react";
import { useNotificationStore } from "@/stores/notification.store";
import { IconCheck, IconCopy } from "@/app/_components/icon/icons";

/** نمایش کد معرف به همراه دکمه‌ی کپی در کلیپ‌بورد */
export default function ReferralCode({ code }: { code: string }) {
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [copied, setCopied] = useState(false);

	const copyHandler = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			showNotification({ type: "success", message: "کد معرف کپی شد" });
			setTimeout(() => setCopied(false), 1500);
		} catch {
			showNotification({ type: "error", message: "کپی کد با خطا مواجه شد" });
		}
	};

	return (
		<div className="bg-white border-2 border-dashed border-secondary pr-4 pl-2 py-2 rounded-lg flex items-center gap-2">
			<span className="font-mono font-bold text-lg tracking-widest text-primary">{code}</span>
			<button
				type="button"
				onClick={copyHandler}
				aria-label="کپی کد معرف"
				title="کپی کد معرف"
				className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary/10 duration-150 shrink-0"
			>
				{copied ? (
					<IconCheck className="stroke-success w-4 h-4" strokeWidth={2} />
				) : (
					<IconCopy className="stroke-secondary w-4 h-4" />
				)}
			</button>
		</div>
	);
}
