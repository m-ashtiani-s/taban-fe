import DatePicker, { Value } from "react-multi-date-picker";
import { useEffect, useRef, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import transition from "react-element-popper/animations/transition";
import opacity from "react-element-popper/animations/opacity";
import moment from "jalali-moment";
import { TabanDatePickerProps } from "./tabanDatePicker.type";

/**
 * Normalize any picker value (JS Date or a DateObject from
 * react-multi-date-picker) to a jalali string `jYYYY/jMM/jDD` with English
 * digits, exactly the shape we keep in parent state.
 *
 * Do NOT rely on `value.toString()` — on a raw JS `Date` it returns
 * "Sun May 19 2024 03:30:00 GMT+0330", which corrupts the parent state.
 */
function pickerValueToJalali(value: Value | undefined | null): string | null {
	if (!value) return null;

	let jsDate: Date | null = null;
	if (value instanceof Date) {
		jsDate = value;
	} else if (typeof (value as any)?.toDate === "function") {
		jsDate = (value as any).toDate();
	}

	if (!jsDate || isNaN(jsDate.getTime())) return null;
	return moment(jsDate).format("jYYYY/jMM/jDD");
}

export default function TabanDatePicker({ placeholder = "انتخاب تاریخ", selectedDate, setSelectedDate }: TabanDatePickerProps) {
	const [date, setDate] = useState<Value>(() => {
		if (!selectedDate) return null;
		const m = moment(selectedDate, "jYYYY/jMM/jDD");
		return m.isValid() ? m.toDate() : null;
	});

	// Track the jalali we last synced *to* the parent so we don't re-emit it.
	const lastEmittedRef = useRef<string | null>(selectedDate ?? null);

	// One-way sync: parent → picker.
	// Only re-aligns the picker when the parent's value diverges from what we
	// last emitted (i.e. a real external change).
	useEffect(() => {
		if (selectedDate === lastEmittedRef.current) return;
		lastEmittedRef.current = selectedDate ?? null;

		if (!selectedDate) {
			setDate(null);
			return;
		}
		const m = moment(selectedDate, "jYYYY/jMM/jDD");
		if (m.isValid()) {
			setDate(m.toDate());
		}
	}, [selectedDate]);

	// Picker → parent sync happens only on actual user interaction (onChange),
	// so there's no chance of a feedback loop with the effect above.
	const handlePickerChange = (value: Value) => {
		setDate(value);
		const jalali = pickerValueToJalali(value);
		lastEmittedRef.current = jalali;
		setSelectedDate(jalali);
	};

	return (
		<div className="flex [&_svg]:!left-3 w-full [&>div]:!w-full">
			<DatePicker
				highlightToday={false}
				onOpenPickNewDate={false}
				className="border-[#79747E] w-full"
				placeholder={placeholder}
				animations={[
					opacity(),
					transition({
						from: 40,
						transition: "all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)",
					}),
				]}
				calendar={persian}
				value={date}
				onChange={handlePickerChange}
				locale={persian_fa}
				calendarPosition="bottom-center"
				inputClass="py-2 h-12 !w-full px-4 !outline-none focus:!border-secondary rounded-lg rounded-xl pl-[48px]  border-1 text-base !outline-0 text-[#08090C] border-[#34426680] hover:border-[#34426680]  focus:border-[#08090C]"
			/>
		</div>
	);
}
