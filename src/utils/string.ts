import { convertToPersianNumber } from "./enNumberToPersian";

export function generateID(): string {
    return Math.random().toString(36).substring(2, 9) + '' + new Date().getTime();
}

export function padWithZero<T extends number | string, U extends number>(
    number: T,
    width: U
): string {
    return number.toString().padStart(width, '0');
}

export function limitText(text: string, charLimit: number = 20): string {
    if (text.length > charLimit) {
        return text.substring(0, charLimit) + '...';
    }
    return text;
}

export function generateUUID() {
    let d = new Date().getTime(); // Timestamp
    let d2 = (performance && performance.now && (performance.now()*1000)) || 0; // Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16; // random number between 0 and 16
        if(d > 0){ // Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else { // Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c==='x' ? r : (r&0x3|0x8)).toString(16);
    });
}

export function toCurrency(amount: string | number) {
	const number= parseFloat(amount?.toString())
		.toFixed(2)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
		.replace('.00', '');

		return convertToPersianNumber(number)
}

export const roundFloatNumber = (e: number) => {
	return Math.round(e * 100) / 100;
};

/** ریشه‌ی پوشه‌ی آپلود: شناسه‌ی کاربر اگر وارد شده باشد، وگرنه یک شناسه‌ی تصادفی برای تفکیک. */
const uploadRoot = (scope: string): string => (scope ?? "").trim() || "anonymous";

/**
 * نام پوشه‌ی ذخیره‌سازی فایل‌های یک مدرک را بر اساس کاربر و نام همان مدرک می‌سازد:
 * «<scope>/assets/<نام مدرک>». فاصله‌ها و جداکننده‌های مسیر پاک‌سازی می‌شوند تا کلید
 * استوریج معتبر بماند، ولی حروف فارسیِ نام برای قابل‌تشخیص بودن پوشه حفظ می‌شود.
 */
export const assetFolderName = (scope: string, documentName: string): string => {
	const cleaned = (documentName ?? "")
		.trim()
		.replace(/[\\/]+/g, "-")
		.replace(/\s+/g, "_");
	return `${uploadRoot(scope)}/assets/${cleaned || "document"}`;
};

/** پوشه‌ی ذخیره‌سازی تصاویر پاسپورت برای یک کاربر: «<scope>/passport». */
export const passportFolderName = (scope: string): string => `${uploadRoot(scope)}/passport`;

export const getVerificationCodeFailCauseName = (code?: String) => {
	switch (code) {
		case "CONSIGNEE_UNAVAILABLE":
			return "شخص گیرنده حضور نداشت و امکان دسترسی به «کد تحویل» نبود.";
		case "CODE_CAN_NOT_SEND":
			return "کد تحویل به «موبایل گیرنده» ارسال نشد.";
		case "MOBILE_UNAVAILABLE":
			return " تلفن همراه شخص گیرنده نزد او نبود.";
		case "WRONG_NUMBER":
			return "«شماره گیرنده» اشتباه ثبت شده بود.";
		case "OTHER":
			return "-";
		default:
			return "-";
	}
};


export const generateFailCause = (e?: string) => {
	switch (e) {
		case "INVALID_ADDRESS":
			return "اشتباه بودن آدرس";
		case "ABSENT":
			return "عدم حضور گیرنده";
		case "REFUSAL_SHIPMENT":
			return "خودداری از قبول مرسوله توسط گیرنده";
		case "REFUSAL_PAYMENT":
			return "خودداری از پرداخت مبلغ توسط گیرنده";
		case "CUSTOMER_REQUEST_ANOTHER_LOCATION":
			return "درخواست مشتری بابت تحویل در مکان دیگر";
		case "LOST_PARCEL":
			return "بسته مفقود شده";
		case "OUT_OF_RANGE":
			return "خارج از محدوده";
		case "CANCELED_BY_OPERATION":
			return "عدم ارسال";
		case "INVALID_GEOCODED_POINT":
			return "فاصله زیاد آدرس با نقطه ثبت شده";
		case "NO_VERIFICATION_CODE_PROVIDED_BY_CONSIGNEE":
			return "عدم ارائه کد تحویل توسط مشتری";
		default:
			return "-";
	}
};

export const convertPersianToEnglish = (persianNumber:string) => {
	const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
	const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	
	let englishNumber = persianNumber;
	for (let i = 0; i < 10; i++) {
	  const regex = new RegExp(persianDigits[i], 'g');
	  englishNumber = englishNumber.replace(regex, englishDigits[i]);
	}
  
	return +englishNumber;
  };
export const convertPersianToEnglishString = (persianNumber:string) => {
	const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
	const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	
	let englishNumber = persianNumber;
	for (let i = 0; i < 10; i++) {
	  const regex = new RegExp(persianDigits[i], 'g');
	  englishNumber = englishNumber.replace(regex, englishDigits[i]);
	}
  
	return englishNumber;
  };
  