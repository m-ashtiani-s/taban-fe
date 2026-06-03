import { Fragment, useMemo } from "react";
import { IconCheck } from "@/app/_components/icon/icons";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { PHASES, StepKey } from "../../_config/steps";

type OrderStepperProps = {
	/** توالی فعالِ مراحل (داینامیک بر اساس نرخ‌های دریافتی) */
	steps: StepKey[];
	currentStep: StepKey;
};

/**
 * استپر داینامیک: فقط فازهایی را نشان می‌دهد که در مسیر فعلی سفارش حضور دارند.
 * وضعیت هر فاز (انجام‌شده / فعال / در انتظار) از روی مرحله‌ی جاری محاسبه می‌شود.
 */
export default function OrderStepper({ steps, currentStep }: OrderStepperProps) {
	const visiblePhases = useMemo(() => PHASES.filter((p) => p.steps.some((s) => steps.includes(s))), [steps]);
	const currentPhaseIndex = visiblePhases.findIndex((p) => p.steps.includes(currentStep));
	const progress =
		visiblePhases.length > 1 ? (currentPhaseIndex / (visiblePhases.length - 1)) * 100 : 0;

	return (
		<div className="w-full">
			{/* عنوان فاز جاری برای موبایل */}
			<div className="md:hidden flex items-center justify-between mb-3">
				<span className="peyda font-bold text-primary">{visiblePhases[currentPhaseIndex]?.title}</span>
				<span className="text-xs text-neutral-400">
					{convertToPersianNumber(currentPhaseIndex + 1)} / {convertToPersianNumber(visiblePhases.length)}
				</span>
			</div>

			<div className="relative flex items-start justify-between gap-1">
				{/* خط پایه و خط پیشرفت */}
				<div className="absolute top-4 right-4 left-4 h-[2px] bg-neutral-200 rounded-full" />
				<div
					className="absolute top-4 right-4 h-[2px] bg-gradient-to-l from-primary to-secondary rounded-full transition-all duration-500"
					style={{ width: `calc((100% - 2rem) * ${progress / 100})` }}
				/>

				{visiblePhases.map((phase, index) => {
					const isDone = index < currentPhaseIndex;
					const isActive = index === currentPhaseIndex;
					return (
						<Fragment key={phase.title}>
							<div className="relative z-[1] flex flex-col items-center gap-2 flex-1 min-w-0">
								<div
									className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all duration-300 ${
										isDone
											? "bg-primary text-white"
											: isActive
												? "bg-secondary text-white ring-4 ring-secondary/20 scale-105"
												: "bg-white text-neutral-400 border border-dashed border-neutral-300"
									}`}
								>
									{isDone ? <IconCheck className="stroke-white w-4 h-4" strokeWidth={2} /> : convertToPersianNumber(index + 1)}
								</div>
								<span
									className={`hidden md:block text-center text-xs leading-5 h-5 whitespace-nowrap transition-colors duration-300 ${
										isActive ? "peyda font-bold text-primary" : isDone ? "text-primary/70" : "text-neutral-400"
									}`}
								>
									{phase.title}
								</span>
							</div>
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
