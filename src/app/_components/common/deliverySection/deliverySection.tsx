"use client";

import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import TabanDatePicker from "@/app/_components/memarDatePicker/tabanDatePicker";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { IconCalendar } from "@/app/_components/icon/icons";
import { UrgencyEndpoints } from "@/app/_api/urgencyEndpoints";

type DeliverySectionProps = {
	hasJustice: boolean;
	hasMfa: boolean;
	desiredDate: string | null;
	onDateChange: (date: string | null) => void;
};

/**
 * بخش زمان تحویل: بازه‌ی روزهای کاری را بر اساس تنظیمات فوریت و تاییدات انتخاب‌شده نمایش می‌دهد
 * و امکان انتخاب تاریخ تحویل دلخواه را می‌دهد. در هر سه فلوی سفارش استفاده می‌شود.
 */
export default function DeliverySection({ hasJustice, hasMfa, desiredDate, onDateChange }: DeliverySectionProps) {
	const urgencyQuery = useQuery({
		queryKey: ["urgency"],
		queryFn: () => withMappedError(() => UrgencyEndpoints.getUrgency()),
	});

	const s = urgencyQuery.data?.data;
	const min = s ? s.translationMinDays + (hasJustice ? s.justiceMinDays : 0) + (hasMfa ? s.mfaMinDays : 0) : 0;
	const max = s ? s.translationMaxDays + (hasJustice ? s.justiceMaxDays : 0) + (hasMfa ? s.mfaMaxDays : 0) : 0;

	return (
		<div className="rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/5 to-white p-5 flex flex-col gap-4">
			<div className="flex items-center gap-2 text-sm font-bold peyda text-primary">
				<IconCalendar className="stroke-primary w-5 h-5" />
				زمان تحویل
			</div>

			{urgencyQuery.isLoading ? (
				<div className="flex items-center gap-2 text-sm text-neutral-500 py-2">
					<TabanLoading size={20} />
					در حال دریافت زمان تحویل...
				</div>
			) : s ? (
				<>
					<div className="text-sm text-neutral-700 leading-7">
						این سفارش طی{" "}
						<span className="font-bold text-primary peyda">
							{convertToPersianNumber(String(min))} تا {convertToPersianNumber(String(max))} روز کاری
						</span>{" "}
						تحویل داده می‌شود.
					</div>
					<div className="text-xs text-neutral-500 leading-6">
						اگر تاریخ دلخواهی مدنظر دارید، انتخاب کنید؛ کارشناسان ما در این خصوص با شما تماس می‌گیرند.
					</div>
					<div className="flex items-end gap-2">
						<div className="flex-1">
							<TabanDatePicker
								placeholder="تاریخ تحویل دلخواه (اختیاری)"
								selectedDate={desiredDate}
								disablePast
								disableHolidays
								setSelectedDate={(v) =>
									onDateChange(typeof v === "function" ? (v as (p: string | null) => string | null)(desiredDate) : v)
								}
							/>
						</div>
						{desiredDate && (
							<button
								type="button"
								onClick={() => onDateChange(null)}
								className="text-xs text-error hover:underline pb-3 shrink-0"
							>
								حذف تاریخ
							</button>
						)}
					</div>
				</>
			) : null}
		</div>
	);
}
