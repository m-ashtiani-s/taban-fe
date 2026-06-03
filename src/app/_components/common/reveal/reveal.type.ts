import { ReactNode } from "react";

export type RevealProps = {
	children: ReactNode;
	/** تأخیر شروع انیمیشن (ثانیه) — برای ساخت حالت پلکانی در گرید‌ها */
	delay?: number;
	/** جابه‌جایی عمودی اولیه بر حسب px */
	y?: number;
	/** مدت انیمیشن بر حسب ثانیه */
	duration?: number;
	/** فقط یک‌بار هنگام اولین دیده‌شدن اجرا شود */
	once?: boolean;
	className?: string;
};
