"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { useProfiletore } from "@/stores/profile";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { PassportEndpoints } from "@/app/_api/passportEndpoints";
import { passportFolderName } from "@/utils/string";
import { Passport } from "@/types/passport.type";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import FileUploader from "@/app/_components/common/fileUploader/fileUploader";
import { IconUpload } from "@/app/_components/icon/icons";

type PassportModalProps = {
	open: boolean;
	setOpen: (v: boolean) => void;
	/** پس از ساخت موفق، پاسپورت تازه‌ساخته‌شده برگردانده می‌شود */
	onCreated?: (passport: Passport | null) => void;
};

/**
 * مودال سبکِ ساخت پاسپورت: فقط یک عنوان و یک تصویر. تصویر به پوشه‌ی مخصوص همان
 * کاربر آپلود می‌شود و سپس پاسپورت با عنوان و آدرس تصویر ساخته می‌شود.
 */
export default function PassportModal({ open, setOpen, onCreated }: PassportModalProps) {
	const showNotification = useNotificationStore((s) => s.showNotification);
	const profile = useProfiletore((s) => s.profile);
	const scope = profile?.userId || "";

	const [title, setTitle] = useState<string>("");
	const [files, setFiles] = useState<File[]>([]);
	const [image, setImage] = useState<string>("");
	const [titleError, setTitleError] = useState<string>("");

	const upload = useApi(async (f: File[]) => await TranslationEndpoints.uploadStorageFiles(f, passportFolderName(scope)));
	const create = useApi(async (t: string, img: string) => await PassportEndpoints.createPassport({ title: t, image: img }));

	const reset = () => {
		setTitle("");
		setFiles([]);
		setImage("");
		setTitleError("");
	};

	useEffect(() => {
		if (!open) reset();
	}, [open]);

	useEffect(() => {
		if (!upload.result) return;
		if (upload.result.success) {
			const url = upload.result.data?.[0] ?? "";
			if (url) {
				setImage(url);
				setFiles([]);
			}
		} else {
			showNotification({ type: "error", message: upload.result.description || "آپلود تصویر پاسپورت با خطا مواجه شد" });
		}
	}, [upload.result]);

	useEffect(() => {
		if (!create.result) return;
		if (create.result.success) {
			showNotification({ type: "success", message: "پاسپورت با موفقیت ایجاد شد" });
			onCreated?.(create.result.data?.data ?? null);
			setOpen(false);
		} else {
			showNotification({ type: "error", message: create.result.description || "ایجاد پاسپورت با خطا مواجه شد" });
		}
	}, [create.result]);

	const submit = () => {
		let ok = true;
		if (!title.trim()) {
			setTitleError("عنوان پاسپورت الزامی است");
			ok = false;
		} else {
			setTitleError("");
		}
		if (!image) {
			showNotification({ type: "error", message: "بارگذاری تصویر پاسپورت الزامی است" });
			ok = false;
		}
		if (!ok) return;
		create.fetchData(title.trim(), image);
	};

	return (
		<TabanModal open={open} setOpen={setOpen} title="افزودن پاسپورت" onClose={() => setOpen(false)}>
			<div className="flex flex-col gap-4">
				<TabanInput
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					name="title"
					label="عنوان پاسپورت"
					isHandleError
					hasError={!!titleError}
					errorText={titleError}
				/>

				<FileUploader
					files={files}
					onChange={setFiles}
					uploadedUrls={image ? [image] : []}
					onRemoveUploaded={() => setImage("")}
					multiple={false}
					accept="image/*,.pdf"
					allowedExtensions={["JPG", "PNG", "PDF"]}
					isLoading={upload.loading}
					hint="تصویر پاسپورت را اینجا رها کنید یا انتخاب نمایید"
				/>

				{files.length > 0 && !image && (
					<div className="flex justify-end">
						<TabanButton
							onClick={() => upload.fetchData(files)}
							isLoading={upload.loading}
							disabled={upload.loading}
							icon={<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-white" />}
						>
							آپلود تصویر
						</TabanButton>
					</div>
				)}

				<div className="flex justify-end gap-3 mt-4">
					<TabanButton variant="bordered" onClick={() => setOpen(false)} disabled={create.loading}>
						انصراف
					</TabanButton>
					<TabanButton onClick={submit} isLoading={create.loading} disabled={create.loading || upload.loading}>
						ثبت پاسپورت
					</TabanButton>
				</div>
			</div>
		</TabanModal>
	);
}
