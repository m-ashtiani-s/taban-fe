"use client";

import { useState } from "react";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconCheck, IconCopy } from "@/app/_components/icon/icons";
import { useNotificationStore } from "@/stores/notification.store";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { buildImagePromptText } from "../../_utils/buildImagePromptText";
import { ImagePromptProps } from "./imagePrompt.type";

export default function ImagePrompt({ photo, placement, className }: ImagePromptProps) {
	const [copied, setCopied] = useState(false);

	const showNotification = useNotificationStore((s) => s.showNotification);

	const isAi = photo.source === "ai";
	const sizeLabel = `${convertToPersianNumber(photo.width)}×${convertToPersianNumber(photo.height)}`;

	const copyHandler = async () => {
		try {
			await navigator.clipboard.writeText(buildImagePromptText(photo));
			setCopied(true);
			showNotification({ type: "success", message: "پرامپت کپی شد" });
			setTimeout(() => setCopied(false), 1500);
		} catch {
			showNotification({ type: "error", message: "کپی پرامپت با خطا مواجه شد" });
		}
	};

	return (
		<div className={`rounded-2xl border-2 border-dashed border-secondary/60 bg-white text-neutral-700 p-5 max-lg:p-4 flex flex-col gap-4 ${className ?? ""}`}>
			<div className="flex items-start justify-between gap-3 flex-wrap">
				<div className="flex flex-col gap-1">
					<span className="flex items-center gap-2 flex-wrap">
						<span className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 ${isAi ? "bg-primary/10 text-primary" : "bg-secondary/15 text-secondary"}`}>
							{isAi ? "ساخت با AI" : "عکس واقعی"}
						</span>
						<span className="peyda font-bold text-primary">جای عکس: {placement}</span>
					</span>
					<span className="text-xs text-neutral-500">این باکس فقط در پیش‌نمایش پیش‌نویس دیده می‌شود.</span>
				</div>
				<TabanButton
					variant="bordered"
					onClick={copyHandler}
					icon={copied ? <IconCheck className="stroke-success w-4 h-4" strokeWidth={2} /> : <IconCopy className="stroke-secondary w-4 h-4" />}
					className="!text-sm !py-2 !px-4 rounded-xl"
				>
					{copied ? "کپی شد" : isAi ? "کپی پرامپت" : "کپی راهنما"}
				</TabanButton>
			</div>

			<dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
				<dt className="text-neutral-500">ابعاد خروجی</dt>
				<dd className="font-semibold">
					<span dir="ltr" className="inline-block dir-ltr">{sizeLabel}</span> پیکسل · نسبت <span dir="ltr" className="inline-block dir-ltr">{photo.aspectRatio}</span> · WebP، حداکثر ۲۵۰ کیلوبایت
				</dd>
				<dt className="text-neutral-500">ذخیره در</dt>
				<dd dir="ltr" className="dir-ltr text-left font-mono text-xs break-all self-center">
					public{photo.path}
				</dd>
				<dt className="text-neutral-500">متن alt</dt>
				<dd>{photo.alt}</dd>
			</dl>

			{isAi ? (
				<div className="flex flex-col gap-1.5">
					<span className="text-xs text-neutral-500">Prompt</span>
					<p dir="ltr" className="dir-ltr text-left text-[13px] leading-6 bg-suppliment rounded-xl p-3 whitespace-pre-line max-h-56 overflow-y-auto">
						{photo.prompt}
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-1.5">
					<span className="text-xs text-neutral-500">راهنمای عکاسی</span>
					<p className="text-[13px] leading-7 bg-suppliment rounded-xl p-3 whitespace-pre-line">{photo.prompt}</p>
				</div>
			)}
			{photo.negativePrompt && (
				<div className="flex flex-col gap-1.5">
					<span className="text-xs text-neutral-500">Negative prompt</span>
					<p dir="ltr" className="dir-ltr text-left text-[13px] leading-6 bg-neutral-1 rounded-xl p-3">
						{photo.negativePrompt}
					</p>
				</div>
			)}
			<p className="text-xs text-neutral-500 leading-6">
				بعد از آماده شدن عکس، فایل را در مسیر بالا بگذارید و در <span dir="ltr">src/config/docLandings.ts</span> مقدار <span dir="ltr">ready</span> همین عکس را
				true کنید.
			</p>
		</div>
	);
}
