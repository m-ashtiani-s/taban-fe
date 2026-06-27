import { Dispatch, SetStateAction } from "react";

export type TabanDatePickerProps = {
	placeholder?: string;
	selectedDate: string | null;
	setSelectedDate: Dispatch<SetStateAction<string | null>>;
	/** غیرفعال‌کردن روزهای قبل از امروز (مثل دیت‌پیکر بلیط پرواز) */
	disablePast?: boolean;
	/** غیرفعال‌کردن روزهای تعطیل (در حال حاضر تعطیلیِ هفتگیِ جمعه) */
	disableHolidays?: boolean;
};
