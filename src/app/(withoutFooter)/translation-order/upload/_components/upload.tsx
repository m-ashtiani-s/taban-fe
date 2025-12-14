// src/app/storage/page.tsx or /app/storage/page.tsx
"use client";

import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { IconUpload } from "@/app/_components/icon/icons";
import { useEffect, useRef, useState } from "react";

export default function Upload() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchFiles = async () => {
		const res = await fetch("/api/storage/list-files");
		const data = await res.json();
		setFiles(data.files || []);
	};

	const uploadFiles = async () => {
		if (files.length === 0) return;
		setLoading(true);

		const formData = new FormData();
		files.forEach((file) => formData.append("files", file));

		const res = await fetch("/api/storage/upload", {
			method: "POST",
			body: formData,
		});

		setLoading(false);
		if (res.ok) {
			alert("Upload Successful");
			fetchFiles();
		} else {
			alert("Error uploading files");
		}
	};

	useEffect(() => {
		fetchFiles();
	}, []);

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
		<div className="p-4 max-w-2xl mx-auto">
			<label
				htmlFor="file"
				className={`flex gap-2 max-lg:!justify-end items-center border border-dashed text-xs font-light  hover:border-primary duration-100 rounded-lg py-2 w-full px-3 justify-between relative shadow-none border-[#79747E]`}
			>
				<span className="max-lg:!hidden">شما می‌توانید فایل‌های خود را اینجا بکشید و رها کنید</span>

				<TabanButton
					onClick={() => {
						fileInputRef.current?.click();
					}}
					variant="bordered"
					icon={<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-primary" />}
				>
					بارگذاری فایل
				</TabanButton>
				<input ref={fileInputRef} type="file" id="file" hidden multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
			</label>
			{files.length > 0 && (
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
					{files.map((file, index) => {
						const isImage = file.type.startsWith("image/");
						const previewUrl = isImage ? URL.createObjectURL(file) : null;

						return (
							<div key={index} className="relative border rounded-lg p-2 flex flex-col items-center text-center">
								{/* ❌ Remove button */}
								<button
									type="button"
									onClick={() => removeFile(index)}
									className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
								>
									×
								</button>

								{isImage ? (
									<img
										src={previewUrl!}
										alt={file.name}
										className="w-full h-32 object-cover rounded mb-2"
									/>
								) : (
									<div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded mb-2 text-sm">
										📄 File
									</div>
								)}

								<span className="text-xs break-all">{file.name}</span>
							</div>
						);
					})}
				</div>
			)}

			<div className="grid gap-2">
				{/* {files.map((file) => (
					<Card key={file.Key} className="flex items-center justify-between p-2">
						<CardContent className="flex-1 truncate">{file.Key}</CardContent>
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => downloadFile(file.Key)}>
								Download
							</Button>
							<Button variant="destructive" onClick={() => deleteFile(file.Key)}>
								Delete
							</Button>
						</div>
					</Card>
				))} */}
			</div>
		</div>
	);
}
