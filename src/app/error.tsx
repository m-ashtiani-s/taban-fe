"use client";
import { motion } from "framer-motion";
import { IconError, IconHome, IconRetry } from "./_components/icon/icons";
import TabanButton from "./_components/common/tabanButton/tabanButton";

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
	return (
		
		<div className="relative min-h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-suppliment to-white flex items-center justify-center px-4 py-16">
			<div className="pointer-events-none absolute inset-0 -z-[1]">
				<div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-error/10 blur-3xl" />
				<div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
			</div>

			<div className="relative max-w-xl w-full mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 24, scale: 0.97 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="bg-white rounded-3xl border border-suppliment shadow-xl shadow-primary/5 p-8 lg:p-10 flex flex-col items-center text-center gap-6"
				>
					<motion.div
						initial={{ scale: 0.7, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.15, ease: "backOut" }}
						className="relative w-24 h-24 flex items-center justify-center"
					>
						<motion.span
							className="absolute inset-0 rounded-full bg-error/15"
							animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
							transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
						/>
						<span className="relative w-20 h-20 rounded-full bg-error/15 flex items-center justify-center">
							<IconError width={44} height={44} className="fill-error stroke-0" />
						</span>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45, delay: 0.25 }}
						className="flex flex-col gap-2"
					>
						<h1 className="peyda font-bold text-2xl lg:text-3xl text-primary">مشکلی پیش آمد</h1>
						<p className="text-neutral-5 text-sm lg:text-base leading-7">
							متاسفانه در بارگذاری این بخش خطایی رخ داد. می‌توانید دوباره تلاش کنید یا به صفحه‌ی اصلی برگردید.
						</p>
					</motion.div>
					{error?.message && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.4, delay: 0.4 }}
							className="w-full bg-neutral-1/60 border border-neutral-2/60 rounded-xl px-4 py-3 text-xs text-neutral-5 text-right break-words"
						>
							<span className="block peyda font-semibold text-neutral-6 mb-1">جزئیات فنی:</span>
							<span dir="ltr" className="font-mono">{error.message}</span>
							{error.digest && (
								<span dir="ltr" className="block mt-1 text-neutral-4 font-mono">
									#{error.digest}
								</span>
							)}
						</motion.div>
					)}

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45, delay: 0.35 }}
						className="flex items-center gap-3 flex-wrap justify-center"
					>
						<TabanButton
							onClick={reset}
							variant="contained"
							icon={<IconRetry className="fill-white stroke-0" width={18} height={18} />}
						>
							تلاش مجدد
						</TabanButton>
						<TabanButton
							isLink
							href="/"
							variant="bordered"
							icon={<IconHome className="fill-primary stroke-0" width={18} height={18} />}
						>
							بازگشت به خانه
						</TabanButton>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
