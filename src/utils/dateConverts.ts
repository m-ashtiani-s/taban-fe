import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: true });

export function convertToJalali(dateString: string) {
	// تاریخ ورودی به صورت ISO 8601
	const date = moment(dateString);

	// تبدیل به تاریخ شمسی
	return date.format("jYYYY/jMM/jDD HH:mm:ss");
}
export function convertToJalaliDate(dateString: string) {
	// تاریخ ورودی به صورت ISO 8601
	const date = moment(dateString);

	// تبدیل به تاریخ شمسی
	return date.format("jYYYY/jMM/jDD");
}

