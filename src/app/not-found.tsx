"use client";

import { motion } from "framer-motion";
import { IconArrowLine, IconDocument, IconHome, IconTranslate } from "./_components/icon/icons";
import TabanButton from "./_components/common/tabanButton/tabanButton";
import { Footer } from "./_components/footer/footer";
import { Header } from "./_components/header/header";

export default function NotFound() {
	return (
		<>
			<Header />
			<div className="relative min-h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-suppliment to-white flex items-center justify-center px-4 py-16">
				{/* لکه‌های پس‌زمینه‌ی نرم */}
				<div className="pointer-events-none absolute inset-0 -z-[1]">
					<div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-secondary/15 blur-3xl" />
					<div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
				</div>

				{/* آیکن‌های شناور تزئینی */}
				<motion.div
					aria-hidden
					className="absolute top-[18%] right-[12%] text-secondary/30 max-lg:!hidden"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
						<IconDocument width={56} height={56} className="fill-current stroke-0" />
					</motion.div>
				</motion.div>
				<motion.div
					aria-hidden
					className="absolute bottom-[18%] left-[14%] text-primary/20 max-lg:!hidden"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.15 }}
				>
					<motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
						<IconTranslate width={64} height={64} className="fill-current stroke-0" />
					</motion.div>
				</motion.div>

				<div className="relative max-w-2xl w-full mx-auto flex flex-col items-center text-center gap-6">
					{/* عدد ۴۰۴ بزرگ با گرادینت برندینگ */}
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.55, ease: "easeOut" }}
						className="peyda font-black leading-none text-[120px] sm:text-[160px] lg:text-[200px] bg-gradient-to-bl from-primary via-primary/80 to-secondary bg-clip-text text-transparent select-none"
					>
						۴۰۴
					</motion.div>

					<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="flex flex-col gap-3">
						<h1 className="peyda font-bold text-2xl lg:text-3xl text-primary">صفحه‌ی مورد نظر پیدا نشد</h1>
						<p className="text-neutral-5 text-sm lg:text-base leading-7 max-w-md mx-auto">
							به نظر می‌رسد آدرس این صفحه عوض شده یا حذف شده است. می‌توانید به صفحه‌ی اصلی برگردید یا ترجمه‌ی جدیدی را شروع کنید.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.28 }}
						className="flex items-center gap-3 mt-2 flex-wrap justify-center"
					>
						<TabanButton isLink href="/" variant="contained" icon={<IconHome className="fill-white stroke-0" width={18} height={18} />}>
							بازگشت به خانه
						</TabanButton>
						<TabanButton isLink href="/new-order" variant="bordered" icon={<IconArrowLine />}>
							شروع ترجمه آنلاین
						</TabanButton>
					</motion.div>
				</div>
			</div>
			<Footer />
		</>
	);
}
