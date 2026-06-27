"use client";

import { useEffect, useState } from "react";
import FileUploader from "@/app/_components/common/fileUploader/fileUploader";
import { useNotificationStore } from "@/stores/notification.store";
import { useApi } from "@/hooks/useApi";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";

type UploadBoxProps = {
	/** فهرست url فایل‌های آپلودشده (کنترل‌شده از بیرون) */
	value: string[];
	/** با هر تغییر (آپلود موفق یا حذف) فهرست کامل جدید برگردانده می‌شود */
	onChange: (urls: string[]) => void;
	/** پوشه‌ی ذخیره‌سازی در استوریج (اختیاری) */
	folder?: string;
	hint?: string;
	emptyHint?: string;
};

/**
 * باکس آپلود کنترل‌شده و قابل‌استفاده‌ی مجدد برای مدارک و پاسپورت. منطق آپلود و
 * نمایش فایل‌ها یکسان است و state از بیرون (value/onChange) مدیریت می‌شود تا بتوان
 * برای هر مدرک یک باکس مجزا با پوشه‌ی جداگانه داشت.
 *
 * آپلود به‌صورت خودکار انجام می‌شود: کاربر کافی است فایل را انتخاب کند و خودِ
 * باکس بلافاصله آن را بارگذاری می‌کند — دیگر دکمه‌ی جداگانه‌ی «آپلود» وجود ندارد.
 */
export default function UploadBox({ value, onChange, folder, hint, emptyHint }: UploadBoxProps) {
	const showNotification = useNotificationStore((state) => state.showNotification);
	// فایل‌های در حال آپلود (پس از انتخاب، بلافاصله آپلود و سپس از این لیست خالی می‌شوند)
	const [files, setFiles] = useState<File[]>([]);

	const uploaded = value ?? [];
	const hasUploaded = uploaded.length > 0;

	const uploadApi = useApi(async (filesToUpload: File[]) => await TranslationEndpoints.uploadStorageFiles(filesToUpload, folder));

	// با انتخاب فایل‌های جدید، بلافاصله آپلود را شروع کن (در حین آپلود انتخاب جدید قفل است)
	const handleSelect = (selected: File[]) => {
		setFiles(selected);
		if (selected.length > 0) uploadApi.fetchData(selected);
	};

	useEffect(() => {
		if (!uploadApi.result) return;
		if (uploadApi.result.success) {
			const newUrls = uploadApi.result.data ?? [];
			onChange([...(value ?? []), ...newUrls]);
			setFiles([]);
			showNotification({ type: "success", message: "آپلود با موفقیت انجام شد" });
		} else {
			setFiles([]);
			showNotification({
				type: "error",
				message: uploadApi.result.description || "آپلود با خطا مواجه شد، لطفا مجددا تلاش کنید",
			});
		}
	}, [uploadApi.result]);

	const removeUploaded = (url: string) => {
		onChange((value ?? []).filter((u) => u !== url));
	};

	return (
		<div className="w-full flex flex-col gap-3">
			<FileUploader
				files={files}
				onChange={handleSelect}
				uploadedUrls={uploaded}
				onRemoveUploaded={removeUploaded}
				isLoading={uploadApi.loading}
				multiple
				allowedExtensions={["PDF", "JPG", "PNG"]}
				accept="image/*,.pdf"
				hint={hint}
			/>

			<div className="text-xs">
				{uploadApi.loading ? (
					<span className="text-warning">در حال آپلود فایل‌های انتخاب‌شده...</span>
				) : hasUploaded ? (
					<span className="text-success">{uploaded.length} فایل با موفقیت آپلود شده — می‌توانید ادامه دهید</span>
				) : (
					<span className="text-neutral-500">{emptyHint ?? "برای بارگذاری، فایل خود را انتخاب کنید؛ آپلود خودکار انجام می‌شود"}</span>
				)}
			</div>
		</div>
	);
}
