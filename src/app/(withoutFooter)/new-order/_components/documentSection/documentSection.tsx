import { ReactNode } from "react";
import { motion } from "framer-motion";

type DocumentSectionProps = {
	title: ReactNode;
	index?: number;
	children: ReactNode;
};

/**
 * بخش‌بندیِ هر مدرک در مراحلی که اطلاعات به ازای هر مدرک گرفته می‌شود
 * (نرخ پایه، موارد خاص، تاییدات، استعلام‌ها).
 */
export default function DocumentSection({ title, index = 0, children }: DocumentSectionProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.06 }}
			className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4 lg:p-5"
		>
			<div className="flex items-center gap-2 pb-3 mb-4 border-b border-dashed border-neutral-200">
				<span className="w-2.5 h-2.5 rounded-sm bg-secondary rotate-45" />
				<span className="peyda font-bold text-base text-primary">{title}</span>
			</div>
			{children}
		</motion.div>
	);
}
