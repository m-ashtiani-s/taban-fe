import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MemearButtonProps } from "./tabanModal.type";
import { IconCross } from "../../icon/icons";

const backdropVariants = {
	visible: { opacity: 1 },
	hidden: { opacity: 0 },
};

const modalVariants = {
	hidden: { opacity: 0, y: "-100vh" },
	visible: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: "100vh" },
};

export default function TabanModal({ open, setOpen, title, children, onClose }: MemearButtonProps) {
	const handleClose = () => {
		!!onClose && onClose()
		setOpen(false);
	};
	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[500]"
					initial="hidden"
					animate="visible"
					exit="hidden"
					variants={backdropVariants}
					onClick={handleClose}
				>
					<motion.div
						className="bg-white rounded-lg w-full max-w-md mx-auto shadow-lg relative max-lg:!w-11/12"
						variants={modalVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center bg-secondary/15 px-4 py-2">
							<IconCross
								strokeOpacity={0}
								width={24}
								height={24}
								className="relative -top-[2px]"
								fill="#4d4d4d"
							/>
							<div className="font-semibold">{title}</div>
						</div>
						<div className="p-4">{children}</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
