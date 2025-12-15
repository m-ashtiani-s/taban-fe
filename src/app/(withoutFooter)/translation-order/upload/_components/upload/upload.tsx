// src/app/storage/page.tsx or /app/storage/page.tsx
"use client";

import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { IconCross, IconUpload } from "@/app/_components/icon/icons";
import { limitText } from "@/utils/string";
import { useEffect, useRef, useState } from "react";
import { UploadProps } from "./upload.type";
import { useNotificationStore } from "@/stores/notification.store";
import { OrderState, useOrderStore } from "../../../_store/rate.store";

export default function Upload({ justiceInquiryRatesResult, certificationRatesResult, dynamicRatesResult }: UploadProps) {
	const showNotification = useNotificationStore((state) => state.showNotification);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploadFinished, setUploadFinished] = useState(false);
	const { order, setOrder }: OrderState = useOrderStore();

	const uploadFiles = async () => {
		if (files.length === 0) return;
		setLoading(true);

		const formData = new FormData();
		files.forEach((file) => formData.append("files", file));

		const res = await fetch("/api/storage/upload", {
			method: "POST",
			body: formData,
		});
		const data = await res.json();

		setLoading(false);
		if (res.ok) {
			showNotification({
				type: "success",
				message: "آپلود با موفقیت انجام شد",
			});
			setUploadFinished(true);
			setFiles([]);
			setOrder((prev)=>({...prev,assets:data?.files}))
		} else {
			showNotification({
				type: "error",
				message: "آپلود با خطا مواجه شد، لطفا مجددا تلاش کنید",
			});
		}
	};

	useEffect(() => {
		return () => {
			files.forEach((file) => {
				if (file.type.startsWith("image/")) {
					URL.revokeObjectURL(file as any);
				}
			});
		};
	}, [files]);

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="w-full">
			{!uploadFinished && (
				<div className="flex items-center justify-end gap-2 pt-2 px-4 pb-4 bg-white w-full absolute bottom-0 left-0 rounded-lg">
					<TabanButton
						isLink
						href={
							justiceInquiryRatesResult?.success && justiceInquiryRatesResult?.data?.data!?.length > 0
								? "/translation-order/justice-inquiries"
								: certificationRatesResult?.success && certificationRatesResult?.data?.data!?.length > 0
									? "/translation-order/translation-certifications"
									: dynamicRatesResult?.success && dynamicRatesResult?.data?.data!?.length > 0
										? "/translation-order/translation-specials"
										: "/translation-order/language"
						}
						variant="text"
					>
						مرحله قبلی
					</TabanButton>
					<TabanButton isLoading={loading} onClick={uploadFiles}>
						آپلود مدارک
					</TabanButton>
				</div>
			)}
			<div className="relative">
				<label
					htmlFor="file"
					className={`flex max-lg:!justify-end items-center cursor-pointer border border-dashed text-xs font-light  hover:border-primary duration-100 rounded-lg py-2 w-6/12 px-3 justify-between relative shadow-none border-[#79747E]`}
				>
					<span className="max-lg:!hidden">شما می‌توانید فایل‌های خود را با کلیک بر روی این دکمه آپلود کنید</span>

					<TabanButton
						onClick={() => {
							fileInputRef.current?.click();
						}}
						variant="bordered"
						icon={<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-primary" />}
					>
						بارگذاری فایل
					</TabanButton>
					<input
						ref={fileInputRef}
						type="file"
						id="file"
						hidden
						multiple
						onChange={(e) => {
							setUploadFinished(false);
							const newFiles = Array.from(e.target.files || []);
							setFiles((prev) => [...prev, ...newFiles]);
							e.target.value = "";
						}}
					/>
				</label>
				{loading && <div className="bg-white/60 absolute w-full h-full right-0 top-0 z-10"></div>}
			</div>
			{files.length > 0 && (
				<div className="flex w-full pt-6 flex-wrap relative">
					{files.map((file, index) => {
						const isImage = file.type.startsWith("image/");
						const previewUrl = isImage ? URL.createObjectURL(file) : null;

						return (
							<div className="p-2">
								<div
									key={index}
									className="relative border rounded-lg p-2 flex flex-col items-center text-center border-neutral-300"
								>
									<button
										type="button"
										onClick={() => removeFile(index)}
										className="absolute top-1 duration-200 right-1 bg-white group  text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 border border-neutral-300"
									>
										<IconCross
											strokeOpacity={0}
											width={24}
											height={24}
											className="relative group-hover:!fill-white"
											fill="#4d4d4d"
										/>
									</button>

									{isImage ? (
										<div
											style={{ background: `url('${previewUrl!}')` }}
											className="!w-28 !h-28 !bg-cover !bg-center rounded"
										></div>
									) : (
										<div className=" h-28 w-28 flex items-center justify-center bg-neutral-200 rounded mb-2 text-sm">
											📄 File
										</div>
									)}

									<span className="text-xs break-all pt-2">{limitText(file?.name, 14)}</span>
								</div>
							</div>
						);
					})}
					{loading && <div className="bg-white/60 absolute w-full h-full right-0 top-0 z-10"></div>}
				</div>
			)}
		</div>
	);
}
