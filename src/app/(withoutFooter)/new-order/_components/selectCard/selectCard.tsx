import { ReactNode } from "react";
import { IconCheck, IconTick } from "@/app/_components/icon/icons";

type SelectCardProps = {
	selected: boolean;
	onClick: () => void;
	icon?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	/** محتوای انتهای کارت (مثلا کنترل تعداد). با کلیک روی آن انتخاب کارت اجرا نمی‌شود */
	trailing?: ReactNode;
	/** نوع نشانگر انتخاب: تیک (مربعی) برای حالت چندانتخابی، رادیو برای تک‌انتخابی */
	indicator?: "check" | "radio" | "none";
	className?: string;
};

/**
 * کارت انتخابیِ قابل استفاده‌ی مجدد در تمام مراحلِ انتخابی (مدرک، زبان، تاییدات، استعلام‌ها).
 * حالت انتخاب‌شده با لمس ملایم رنگ برند (طلایی/secondary) مشخص می‌شود.
 */
export default function SelectCard({
	selected,
	onClick,
	icon,
	title,
	description,
	trailing,
	indicator = "check",
	className = "",
}: SelectCardProps) {
	return (
		<div
			onClick={onClick}
			className={`group relative flex items-center justify-between gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
				selected
					? "border-secondary bg-secondary/10 ring-1 ring-secondary/40 shadow-sm"
					: "border-neutral-200 hover:border-secondary/50 hover:bg-secondary/[0.04]"
			} ${className}`}
		>
			<div className="flex items-center gap-3 min-w-0">
				{icon && (
					<div
						className={`shrink-0 transition-colors duration-300 ${
							selected ? "text-secondary" : "text-primary/70 group-hover:text-secondary"
						}`}
					>
						{icon}
					</div>
				)}
				<div className="flex flex-col min-w-0">
					<div className={`peyda font-semibold truncate ${selected ? "text-primary" : "text-neutral-600"}`}>{title}</div>
					{description && <div className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{description}</div>}
				</div>
			</div>

			<div className="flex items-center gap-2 shrink-0">
				{trailing}
				{indicator !== "none" && (
					<div
						className={`flex items-center justify-center w-6 h-6 transition-all duration-300 ${
							indicator === "radio" ? "rounded-full" : "rounded-md"
						} border ${selected ? "bg-secondary border-secondary" : "border-neutral-300 group-hover:border-secondary/60"}`}
					>
						{selected && <IconTick className="stroke-white w-4 h-4" strokeWidth={3.5} />}
					</div>
				)}
			</div>
		</div>
	);
}
