"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { useNotificationStore } from "@/stores/notification.store";
import { useProfile } from "@/hooks/useProfile";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { PassportEndpoints } from "@/app/_api/passportEndpoints";
import { passportFolderName } from "@/utils/string";
import { Passport } from "@/types/passport.type";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import FileUploader from "@/app/_components/common/fileUploader/fileUploader";

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
	const { profile } = useProfile();
	const scope = profile?.userId || "";

	const [title, setTitle] = useState<string>("");
	const [files, setFiles] = useState<File[]>([]);
	const [image, setImage] = useState<string>("");
	const [titleError, setTitleError] = useState<string>("");

	const upload = useMutation({
		mutationFn: (f: File[]) => withMappedError(() => TranslationEndpoints.uploadStorageFiles(f, passportFolderName(scope))),
		meta: { showNotification: true },
		onSuccess: (data) => {
			const url = data?.[0] ?? "";
			if (url) {
				setImage(url);
				setFiles([]);
			}
		},
	});

	const create = useMutation({
		mutationFn: (payload: { title: string; image: string }) => withMappedError(() => PassportEndpoints.createPassport(payload)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			showNotification({ type: "success", message: "پاسپورت با موفقیت ایجاد شد" });
			onCreated?.(data?.data ?? null);
			setOpen(false);
		},
	});

	const reset = () => {
		setTitle("");
		setFiles([]);
		setImage("");
		setTitleError("");
	};

	// با انتخاب تصویر، بلافاصله آپلود انجام می‌شود (بدون دکمه‌ی جداگانه)
	const handleSelect = (selected: File[]) => {
		setFiles(selected);
		if (selected.length > 0) upload.mutate([selected[0]]);
	};

	useEffect(() => {
		if (!open) reset();
	}, [open]);

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
		create.mutate({ title: title.trim(), image });
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
					onChange={handleSelect}
					uploadedUrls={image ? [image] : []}
					onRemoveUploaded={() => setImage("")}
					multiple={false}
					accept="image/*,.pdf"
					allowedExtensions={["JPG", "PNG", "PDF"]}
					isLoading={upload.isPending}
					hint="تصویر پاسپورت را اینجا رها کنید یا انتخاب نمایید"
				/>

				<div className="flex justify-end gap-3 mt-4">
					<TabanButton variant="bordered" onClick={() => setOpen(false)} disabled={create.isPending}>
						انصراف
					</TabanButton>
					<TabanButton onClick={submit} isLoading={create.isPending} disabled={create.isPending || upload.isPending}>
						ثبت پاسپورت
					</TabanButton>
				</div>
			</div>
		</TabanModal>
	);
}
