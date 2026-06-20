"use client";

import { useState } from "react";
import { useNotificationStore } from "@/stores/notification.store";
import { IconCheck, IconCopy } from "@/app/_components/icon/icons";

/** نمایش کد معرف به همراه دکمه‌ی کپی کد و کپی لینک دعوت */
export default function ReferralCode({ code }: { code: string }) {
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [copied, setCopied] = useState(false);
	const [linkCopied, setLinkCopied] = useState(false);

	const buildInviteLink = () =>
		typeof window !== "undefined" ? `${window.location.origin}/auth?ref=${code}` : `/auth?ref=${code}`;

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

	const copyLinkHandler = async () => {
		try {
			await navigator.clipboard.writeText(buildInviteLink());
			setLinkCopied(true);
			showNotification({ type: "success", message: "لینک دعوت کپی شد" });
			setTimeout(() => setLinkCopied(false), 1500);
		} catch {
			showNotification({ type: "error", message: "کپی لینک با خطا مواجه شد" });
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
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
			<button
				type="button"
				onClick={copyLinkHandler}
				title="کپی لینک دعوت"
				className="flex items-center gap-1.5 text-sm font-medium text-secondary border border-secondary/40 hover:bg-secondary/10 duration-150 rounded-lg px-3 py-2"
			>
				{linkCopied ? (
					<IconCheck className="stroke-success w-4 h-4" strokeWidth={2} />
				) : (
					<IconCopy className="stroke-secondary w-4 h-4" />
				)}
				کپی لینک دعوت
			</button>
		</div>
	);
}
