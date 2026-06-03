import { ReactNode } from "react";

type StepHeaderProps = {
	title: string;
	subtitle?: string;
	icon?: ReactNode;
};

/** سرتیتر یکدست برای هر مرحله: عنوان درشت peyda + توضیح کوتاه اختیاری */
export default function StepHeader({ title, subtitle, icon }: StepHeaderProps) {
	return (
		<div className="flex flex-col items-center text-center gap-2">
			{icon && (
				<div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-1">
					{icon}
				</div>
			)}
			<h2 className="peyda font-extrabold text-2xl lg:text-3xl text-primary">{title}</h2>
			{subtitle && <p className="text-sm text-neutral-400 max-w-xl leading-7">{subtitle}</p>}
		</div>
	);
}
