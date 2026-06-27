"use client";

import { useEffect, useState } from "react";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanModal from "@/app/_components/common/tabanModal/tabanModal";
import { IconEdit } from "@/app/_components/icon/icons";

type DocumentDescriptionFieldProps = {
	/** عنوان مدرک (برای نمایش در عنوان مودال) */
	docTitle?: string;
	/** توضیح فعلیِ این مدرک */
	value: string;
	/** ذخیره‌ی توضیح جدید */
	onChange: (value: string) => void;
};

/**
 * گرفتنِ یک توضیح اختیاری برای هر مدرک، بدون به‌هم‌ریختنِ دیزاینِ مرحله‌ی آپلود.
 * توضیح در یک مودال جداگانه گرفته می‌شود و در صفحه فقط یک دکمه‌ی کوچک با آیکن دیده می‌شود.
 */
export default function DocumentDescriptionField({ docTitle, value, onChange }: DocumentDescriptionFieldProps) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(value ?? "");

	// هر بار که مودال باز می‌شود، draft را با مقدار فعلی هم‌گام می‌کنیم
	useEffect(() => {
		if (open) setDraft(value ?? "");
	}, [open]);

	const hasDescription = (value ?? "").trim().length > 0;

	const save = () => {
		onChange(draft.trim());
		setOpen(false);
	};

	return (
		<div className="mt-3 flex flex-col gap-2">
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="self-start flex items-center gap-1.5 text-xs text-secondary hover:text-primary duration-150"
			>
				<IconEdit className="stroke-current w-4 h-4" />
				<span>{hasDescription ? "ویرایش توضیحات این مدرک" : "افزودن توضیحات برای این مدرک"}</span>
			</button>

			{hasDescription && (
				<div className="text-xs leading-6 text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 whitespace-pre-line">
					{value}
				</div>
			)}

			<TabanModal
				width={520}
				open={open}
				setOpen={setOpen}
				title={docTitle ? `توضیحات ${docTitle}` : "توضیحات مدرک"}
			>
				<div className="flex flex-col gap-4">
					<div className="text-xs text-neutral-500 leading-6">
						در صورت تمایل، توضیحی برای این مدرک بنویسید (مثلاً نکته‌ای که لازم است کارشناسان ما هنگام ترجمه بدانند).
					</div>
					<textarea
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						rows={5}
						placeholder="توضیحات این مدرک را اینجا بنویسید..."
						className="w-full resize-none rounded-lg border border-[#34426680] focus:border-[#08090C] outline-none p-3 text-sm leading-7 text-[#08090C]"
					/>
					<div className="flex items-center justify-end gap-2">
						<TabanButton variant="text" onClick={() => setOpen(false)}>
							انصراف
						</TabanButton>
						<TabanButton onClick={save}>ذخیره توضیحات</TabanButton>
					</div>
				</div>
			</TabanModal>
		</div>
	);
}
