import DatePicker, { Value } from "react-multi-date-picker";
import { useEffect, useRef, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import transition from "react-element-popper/animations/transition";
import opacity from "react-element-popper/animations/opacity";
import { convertPersianToEnglishString } from "@/utils/string";
import moment from "jalali-moment";
import InputIcon from "react-multi-date-picker/components/input_icon";
import { TabanDatePickerProps } from "./tabanDatePicker.type";

export default function TabanDatePicker({ placeholder = "انتخاب تاریخ", selectedDate, setSelectedDate }: TabanDatePickerProps) {
	const [date, setDate] = useState<Value>();

	useEffect(() => {
		if ((!!date && selectedDate && selectedDate !== convertPersianToEnglishString(date?.toString())) || (!date && selectedDate)) {
			const mydate = moment(selectedDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD");
			const newDate = new Date(mydate);
			setDate(newDate);
		}
	}, [selectedDate]);

	useEffect(() => {
		date?.toString() ? setSelectedDate(convertPersianToEnglishString(date?.toString())) : setSelectedDate(null);
	}, [date]);

	return (
		<div className="flex [&_svg]:!left-3 w-full [&>div]:!w-full">
			<DatePicker
				// render={
				// 	<InputIcon className="py-2 border border-[#79747E] px-4 !outline-none focus:!border-secondary rounded-lg" />
				// }
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
				onChange={setDate}
				locale={persian_fa}
				calendarPosition="bottom-center"
				inputClass="py-2 h-12 !w-full px-4 !outline-none focus:!border-secondary rounded-lg rounded-xl pl-[48px]  border-1 text-base !outline-0 text-[#08090C] border-[#34426680] hover:border-[#34426680]  focus:border-[#08090C]"
			/>
		</div>
	);
}
