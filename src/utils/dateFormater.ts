import moment from "jalali-moment";

type DateFormatType = "yyyy/mm/dd" | "yyyy/mm/dd hh:mm" | "yyyy/mm" | "hh:mm";

export function formatJalaliDate(utcDate: string, formatType: DateFormatType = "yyyy/mm/dd"): string {
	// زمان UTC رو می‌گیریم و به منطقه زمانی ایران تبدیل می‌کنیم
	const m = moment(utcDate)
		.utcOffset(3.5 * 60)
		.locale("fa").format;

	switch (formatType) {
		case "yyyy/mm/dd":
			return moment(utcDate)
				.utcOffset(3.5 * 60)
				.locale("fa")
				.format("jYYYY/jMM/jDD");
		case "yyyy/mm/dd hh:mm":
			return moment(utcDate)
				.utcOffset(3.5 * 60)
				.locale("fa")
				.format("jYYYY/jMM/jDD HH:mm");
		case "yyyy/mm":
			return moment(utcDate)
				.utcOffset(3.5 * 60)
				.locale("fa")
				.format("jYYYY/jMM");
		case "hh:mm":
			return moment(utcDate)
				.utcOffset(3.5 * 60)
				.locale("fa")
				.format("HH:mm");
		default:
			return "";
	}
}
