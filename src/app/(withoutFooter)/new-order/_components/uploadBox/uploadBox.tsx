"use client";

import { useEffect, useState } from "react";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import FileUploader from "@/app/_components/common/fileUploader/fileUploader";
import { IconUpload } from "@/app/_components/icon/icons";
import { useNotificationStore } from "@/stores/notification.store";
import { useApi } from "@/hooks/useApi";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { useNewOrderStore } from "../../_store/newOrder.store";

type UploadBoxProps = {
	/** فیلد مقصد در سفارش */
	target: "assets" | "passports";
	/** پوشه‌ی ذخیره‌سازی در استوریج (اختیاری) */
	folder?: string;
	hint?: string;
	emptyHint?: string;
};

/**
 * باکس آپلود مشترک برای مدارک و پاسپورت. منطق آپلود و نگه‌داری url ها در سفارش
 * یکسان است و فقط فیلد مقصد و متن‌ها تغییر می‌کنند.
 */
export default function UploadBox({ target, folder, hint, emptyHint }: UploadBoxProps) {
	const showNotification = useNotificationStore((state) => state.showNotification);
	const { order, setOrder } = useNewOrderStore();
	const [files, setFiles] = useState<File[]>([]);

	const uploaded = order?.[target] ?? [];
	const hasUploaded = uploaded.length > 0;
	const hasPendingFiles = files.length > 0;

	const uploadApi = useApi(async (filesToUpload: File[]) => await TranslationEndpoints.uploadStorageFiles(filesToUpload, folder));

	useEffect(() => {
		if (!uploadApi.result) return;
		if (uploadApi.result.success) {
			const newUrls = uploadApi.result.data ?? [];
			setOrder((prev) => ({ ...prev, [target]: [...(prev?.[target] ?? []), ...newUrls] }));
			setFiles([]);
			showNotification({ type: "success", message: "آپلود با موفقیت انجام شد" });
		} else {
			showNotification({
				type: "error",
				message: uploadApi.result.description || "آپلود با خطا مواجه شد، لطفا مجددا تلاش کنید",
			});
		}
	}, [uploadApi.result]);

	const triggerUpload = () => {
		if (files.length === 0) return;
		uploadApi.fetchData(files);
	};

	const removeUploaded = (url: string) => {
		setOrder((prev) => ({ ...prev, [target]: (prev?.[target] ?? []).filter((u) => u !== url) }));
	};

	return (
		<div className="w-full flex flex-col gap-4">
			<FileUploader
				files={files}
				onChange={setFiles}
				uploadedUrls={uploaded}
				onRemoveUploaded={removeUploaded}
				isLoading={uploadApi.loading}
				multiple
				allowedExtensions={["PDF", "JPG", "PNG"]}
				accept="image/*,.pdf"
				hint={hint}
			/>

			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="text-xs">
					{hasPendingFiles ? (
						<span className="text-warning">{files.length} فایل انتخاب شده — برای ادامه روی «آپلود» کلیک کنید</span>
					) : hasUploaded ? (
						<span className="text-success">{uploaded.length} فایل با موفقیت آپلود شده — می‌توانید ادامه دهید</span>
					) : (
						<span className="text-neutral-500">{emptyHint ?? "ابتدا فایل‌های خود را انتخاب کرده، سپس آپلود کنید"}</span>
					)}
				</div>

				<TabanButton
					onClick={triggerUpload}
					isLoading={uploadApi.loading}
					disabled={!hasPendingFiles}
					icon={<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-white" />}
				>
					آپلود
				</TabanButton>
			</div>
		</div>
	);
}
