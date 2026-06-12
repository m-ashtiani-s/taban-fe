"use client";

import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { PassportEndpoints } from "@/app/_api/passportEndpoints";
import { Passport } from "@/types/passport.type";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import PassportModal from "@/app/_components/common/passportModal/passportModal";
import { IconCross, IconDocument, IconTick } from "@/app/_components/icon/icons";

type PassportPickerProps = {
	/** آدرس تصویرِ پاسپورت‌های انتخاب‌شده (کنترل‌شده) */
	value: string[];
	onChange: (urls: string[]) => void;
};

const PAGE_SIZE = 100;

/**
 * انتخابگر پاسپورت برای فلوهای سفارش: کاربر از لیست پاسپورت‌های خودش چندتایی انتخاب
 * می‌کند و می‌تواند پاسپورت جدید بسازد. مقدارِ ذخیره‌شده «آدرس تصویرِ» پاسپورت‌هاست
 * (نه آیدی). تصاویرِ قدیمیِ سفارش که با هیچ پاسپورتی منطبق نیستند حفظ و قابل‌حذف‌اند.
 */
export default function PassportPicker({ value, onChange }: PassportPickerProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const list = useApi(async () => await PassportEndpoints.getPassports({ isActive: true }, 1, PAGE_SIZE));

	useEffect(() => {
		list.fetchData();
	}, []);

	const passports: Passport[] = list.result?.success ? list.result.data?.data?.elements ?? [] : [];

	const isSelected = (img: string) => value.includes(img);
	const toggle = (img: string) => {
		onChange(isSelected(img) ? value.filter((u) => u !== img) : [...value, img]);
	};

	const legacyUrls = useMemo(() => {
		const known = new Set(passports.map((p) => p.image));
		return value.filter((u) => !known.has(u));
	}, [value, passports]);

	const onCreated = (p: Passport | null) => {
		list.fetchData();
		if (p?.image && !value.includes(p.image)) onChange([...value, p.image]);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="text-sm text-neutral-500">پاسپورت‌های موردنظر را برای این سفارش انتخاب کنید</div>
				<TabanButton variant="bordered" onClick={() => setModalOpen(true)}>
					افزودن پاسپورت جدید
				</TabanButton>
			</div>

			{list.loading && !list.result ? (
				<div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
					<TabanLoading size={24} />
					در حال دریافت پاسپورت‌ها...
				</div>
			) : passports.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{passports.map((p) => {
						const selected = isSelected(p.image);
						return (
							<button
								key={p.passportId}
								type="button"
								onClick={() => toggle(p.image)}
								className={`relative text-right rounded-2xl border p-2 flex flex-col gap-2 duration-200 ${
									selected
										? "border-secondary ring-1 ring-secondary/40 bg-secondary/5"
										: "border-neutral-200 hover:border-secondary/50"
								}`}
							>
								<div
									className="aspect-[4/3] w-full rounded-xl bg-neutral-100 bg-cover bg-center overflow-hidden"
									style={{ backgroundImage: `url('${p.image}')` }}
								/>
								<div className="text-sm font-semibold text-primary truncate px-1">{p.title}</div>
								{selected && (
									<div className="absolute top-3 right-3 w-6 h-6 rounded-md bg-secondary flex items-center justify-center shadow">
										<IconTick className="stroke-white w-4 h-4" strokeWidth={3.5} />
									</div>
								)}
							</button>
						);
					})}
				</div>
			) : (
				<div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
					<div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
						<IconDocument className="fill-primary/60 stroke-0 w-6 h-6" />
					</div>
					<div className="text-sm text-neutral-500">هنوز پاسپورتی ثبت نکرده‌اید</div>
					<TabanButton onClick={() => setModalOpen(true)}>افزودن اولین پاسپورت</TabanButton>
				</div>
			)}

			{legacyUrls.length > 0 && (
				<div className="flex flex-col gap-2 border-t border-dashed border-neutral-200 pt-3">
					<div className="text-xs text-neutral-500">تصاویرِ بارگذاری‌شده‌ی این سفارش</div>
					<div className="flex flex-wrap gap-2">
						{legacyUrls.map((url) => (
							<div
								key={url}
								className="relative w-20 h-20 rounded-lg border border-neutral-200 bg-cover bg-center"
								style={{ backgroundImage: `url('${url}')` }}
							>
								<button
									type="button"
									onClick={() => onChange(value.filter((u) => u !== url))}
									className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-neutral-300 hover:border-error"
									title="حذف"
								>
									<IconCross strokeOpacity={0} width={14} height={14} fill="#4d4d4d" />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			<PassportModal open={modalOpen} setOpen={setModalOpen} onCreated={onCreated} />
		</div>
	);
}
