"use client";

import { useEffect } from "react";
import { IconCopy, IconRequired } from "@/app/_components/icon/icons";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import StepHeader from "../../stepHeader/stepHeader";
import DocumentSection from "../../documentSection/documentSection";

/**
 * مرحله‌ی تعیین تعداد نسخه برای هر مدرک.
 * در نسخه‌های اضافه هزینه‌ی ترجمه (پایه + داینامیک) ثابت می‌ماند و فقط
 * تاییدات، استعلام‌ها و تایید سفارت به ازای هر نسخه دریافت می‌شوند. پیش‌فرض هر مدرک ۱ است.
 */
export default function CopiesStep() {
	const { order, setOrder } = useNewOrderStore();
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);

	// مقداردهی اولیه‌ی تعداد نسخه برای هر مدرک (پیش‌فرض ۱)
	useEffect(() => {
		const current = order?.copyCount ?? {};
		const next: Record<string, string> = { ...current };
		let changed = false;
		keys.forEach((key) => {
			if (next[key] === undefined || next[key] === "") {
				next[key] = "1";
				changed = true;
			}
		});
		if (changed) setOrder((prev) => ({ ...prev, copyCount: next }));
	}, []);

	const setCopyCount = (updater: any) => {
		setOrder((prev) => {
			const current = prev?.copyCount ?? {};
			return { ...prev, copyCount: typeof updater === "function" ? updater(current) : updater };
		});
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="تعداد نسخه مدارک"
				subtitle="در صورت نیاز به نسخه‌ی اضافه، تعداد نسخه‌ی هر مدرک را مشخص کنید"
				icon={<IconCopy width={24} height={24} className="stroke-current fill-none" />}
			/>

			<div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
				{keys.map((key, index) => (
					<DocumentSection key={key} index={index} title={names[key] ?? "مدرک"}>
						<div className="flex flex-col gap-2">
							<span className="text-sm text-neutral-500">تعداد نسخه</span>
							<div className="w-full sm:w-72">
								<TabanInput
									isNumber
									type="number"
									value={order?.copyCount?.[key] ?? "1"}
									groupMode
									setValue={setCopyCount}
									name={key}
									label="تعداد نسخه"
								/>
							</div>
						</div>
					</DocumentSection>
				))}

				<div className="flex items-start gap-2 text-xs text-neutral-500 bg-neutral-100/60 border border-neutral-200 rounded-xl p-3.5 mt-1">
					<IconRequired viewBox="0 0 100 100" width={16} height={16} className="fill-secondary stroke-0 shrink-0 mt-0.5" />
					<span className="leading-6">
						در نسخه‌های اضافه، هزینه‌ی ترجمه تغییری نمی‌کند؛ فقط هزینه‌ی تاییدات، استعلام‌ها و تایید سفارت به ازای هر نسخه دریافت می‌شود.
					</span>
				</div>
			</div>
		</div>
	);
}
