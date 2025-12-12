import { motion } from "framer-motion";

export default function JusticeInquiriesLoading() {
	return (
		<>
			<div className="flex flex-wrap">
				{[...Array(8)].map((_, i) => (
					<motion.div
						key={i}
						className="p-2 w-3/12"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: i * 0.04 }}
					>
						<div className="border border-neutral-200 rounded-lg p-4 animate-pulse justify-between flex items-center">
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-neutral-200 rounded"></div>
								<div className="flex-1 h-4 bg-neutral-200 w-32 rounded"></div>
							</div>
							<div className="w-3 h-3 bg-neutral-200 rounded-full"></div>
						</div>
					</motion.div>
				))}
			</div>
		</>
	);
}
