"use client";

import { useEffect, useRef, useState, DragEvent } from "react";
import { IconCross, IconUpload } from "@/app/_components/icon/icons";
import { limitText } from "@/utils/string";
import { FileUploaderProps } from "./fileUploader.type";

export default function FileUploader({
	files,
	onChange,
	uploadedUrls = [],
	onRemoveUploaded,
	accept,
	allowedExtensions,
	multiple = true,
	isLoading,
	hasError,
	errorText,
	hint = "فایل‌های خود را اینجا رها کنید یا برای انتخاب کلیک کنید",
}: FileUploaderProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

	useEffect(() => {
		const next: Record<string, string> = {};
		files.forEach((file) => {
			if (file.type.startsWith("image/")) {
				next[`${file.name}-${file.size}-${file.lastModified}`] = URL.createObjectURL(file);
			}
		});
		setPreviewUrls(next);
		return () => {
			Object.values(next).forEach((url) => URL.revokeObjectURL(url));
		};
	}, [files]);

	const handleFiles = (incoming: FileList | null) => {
		if (!incoming || incoming.length === 0) return;
		const list = Array.from(incoming);
		onChange(multiple ? [...files, ...list] : [list[0]]);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		if (isLoading) return;
		handleFiles(e.dataTransfer.files);
	};

	const removeNewFile = (index: number) => {
		onChange(files.filter((_, i) => i !== index));
	};

	const triggerPicker = () => {
		if (isLoading) return;
		inputRef.current?.click();
	};

	const hasContent = files.length > 0 || uploadedUrls.length > 0;

	return (
		<div className="flex flex-col gap-3 w-full">
			<div
				onClick={() => !hasContent && triggerPicker()}
				onDrop={handleDrop}
				onDragOver={(e) => {
					e.preventDefault();
					if (!isLoading) setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				className={[
					"relative w-full rounded-lg border-2 border-dashed transition-all duration-200",
					isDragging ? "border-primary bg-primary/5" : "",
					hasError && !isDragging ? "border-error" : !isDragging ? "border-neutral-300 hover:border-primary/50" : "",
					!hasContent ? "cursor-pointer min-h-36 flex flex-col items-center justify-center p-6" : "p-4",
					isLoading ? "opacity-70 cursor-not-allowed" : "",
				].join(" ")}
			>
				<input
					ref={inputRef}
					type="file"
					accept={accept}
					multiple={multiple}
					className="hidden"
					onChange={(e) => {
						handleFiles(e.target.files);
						e.target.value = "";
					}}
				/>

				{!hasContent && (
					<div className={`flex flex-col items-center gap-2 select-none text-center ${isDragging ? "text-primary" : "text-neutral-400"}`}>
						<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
							<IconUpload viewBox="0 0 32 32" width={24} height={24} className="stroke-0 fill-primary" />
						</div>
						<span className="text-sm font-medium text-neutral-600">
							{isDragging ? "فایل را اینجا رها کنید" : hint}
						</span>
						{allowedExtensions && allowedExtensions.length > 0 && (
							<span className="text-xs text-neutral-400">
								فرمت‌های مجاز: {allowedExtensions.join("، ")}
							</span>
						)}
					</div>
				)}

				{hasContent && (
					<div className="flex flex-col gap-4">
						{uploadedUrls.length > 0 && (
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-2 text-xs text-neutral-500">
									<span className="w-2 h-2 rounded-full bg-success"></span>
									<span>فایل‌های آپلود شده ({uploadedUrls.length})</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{uploadedUrls.map((url, index) => {
										const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
										const fileName = url.split("/").pop() ?? "file";
										return (
											<div
												key={`${url}-${index}`}
												className="relative border border-success/50 bg-success/5 rounded-lg p-1.5 flex items-center gap-2 w-48 max-w-full"
											>
												{onRemoveUploaded && (
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															onRemoveUploaded(url);
														}}
														className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-neutral-300 hover:border-error hover:bg-error group transition-colors z-10"
														title="حذف فایل"
													>
														<IconCross
															strokeOpacity={0}
															width={16}
															height={16}
															className="group-hover:!fill-white"
															fill="#4d4d4d"
														/>
													</button>
												)}
												{isImage ? (
													<div
														style={{ backgroundImage: `url('${url}')` }}
														className="w-10 h-10 bg-cover bg-center rounded shrink-0"
													/>
												) : (
													<div className="h-10 w-10 flex items-center justify-center bg-neutral-100 rounded text-base shrink-0">
														📄
													</div>
												)}
												<span className="text-xs text-neutral-600 truncate flex-1 min-w-0">
													{limitText(fileName, 18)}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{files.length > 0 && (
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-2 text-xs text-neutral-500">
									<span className="w-2 h-2 rounded-full bg-warning"></span>
									<span>در انتظار آپلود ({files.length})</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{files.map((file, index) => {
										const isImage = file.type.startsWith("image/");
										const key = `${file.name}-${file.size}-${file.lastModified}`;
										const previewUrl = previewUrls[key];
										return (
											<div
												key={`${key}-${index}`}
												className="relative border border-warning/40 bg-warning/5 rounded-lg p-1.5 flex items-center gap-2 w-48 max-w-full"
											>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														removeNewFile(index);
													}}
													className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-neutral-300 hover:border-error hover:bg-error group transition-colors z-10"
													title="حذف از لیست"
												>
													<IconCross
														strokeOpacity={0}
														width={16}
														height={16}
														className="group-hover:!fill-white"
														fill="#4d4d4d"
													/>
												</button>
												{isImage && previewUrl ? (
													<div
														style={{ backgroundImage: `url('${previewUrl}')` }}
														className="w-10 h-10 bg-cover bg-center rounded shrink-0"
													/>
												) : (
													<div className="h-10 w-10 flex items-center justify-center bg-neutral-100 rounded text-base shrink-0">
														📄
													</div>
												)}
												<span className="text-xs text-neutral-600 truncate flex-1 min-w-0">
													{limitText(file.name, 18)}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{multiple && (
							<button
								type="button"
								onClick={triggerPicker}
								disabled={isLoading}
								className="self-start flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
							>
								<IconUpload viewBox="0 0 32 32" width={16} height={16} className="stroke-0 fill-primary" />
								<span>افزودن فایل بیشتر</span>
							</button>
						)}
					</div>
				)}

				{isLoading && (
					<div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center z-20">
						<div className="flex flex-col items-center gap-2 text-primary text-sm">
							<svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
							</svg>
							<span>در حال آپلود...</span>
						</div>
					</div>
				)}
			</div>

			{hasError && errorText && (
				<div className="text-error text-xs pr-2">{errorText}</div>
			)}
		</div>
	);
}
