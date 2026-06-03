"use client";

import { motion } from "framer-motion";
import { RevealProps } from "./reveal.type";

/**
 * رپر سبک برای انیمیشن ورود (fade + slide-up) هنگام دیده‌شدن در ویوپورت.
 *
 * چون با `whileInView` کار می‌کند، می‌تواند داخل کامپوننت‌های سروری (مثل صفحه‌ی
 * اصلی) هم استفاده شود؛ کافی است هر بخش را با آن بپیچید. با `delay` می‌توان در
 * گرید‌ها حالت پلکانی ساخت.
 */
export default function Reveal({ children, delay = 0, y = 24, duration = 0.5, once = true, className }: RevealProps) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once, amount: 0.2 }}
			transition={{ duration, ease: "easeOut", delay }}
		>
			{children}
		</motion.div>
	);
}
