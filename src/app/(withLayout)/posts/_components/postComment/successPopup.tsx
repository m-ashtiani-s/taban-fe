"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IconClose, IconSuccess } from "@/app/_components/icon/icons";

export const SuccessPopup: React.FC<{ text: string; open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; setFormValues: any; setSubmited: any }> = ({
	text,
	open,
	setOpen,
	setFormValues,
	setSubmited
}) => {
	const [hiden, setHiden] = useState<boolean>(false);

	const boxMotions = {
		initial: { opacity: 0 },
	};

	const transitionProps = {
		duration: 0.2,
		scale: {
			type: "spring",
			damping: 50,
			stiffness: 400,
		},
	};

	const hide = {
		opacity: 0,
		transitionEnd: {
			display: "none",
		},
	};

	const show = {
		opacity: 1,
		display: "block",
	};

	useEffect(() => {
		if (!open) {
			setTimeout(() => {
				setHiden(!open);
			}, 400);
		} else {
			setTimeout(() => {
				setHiden(!open);
			}, 1);
		}
	}, [open]);

	return (
		<>
			{!hiden && (
				<motion.div
					variants={boxMotions}
					initial="initial"
					animate={!!open ? show : hide}
					transition={transitionProps}
					className="w-full h-screen bg-black/60 fixed z-[100] top-0 left-0 search"
				>
					<div
						onClick={() => {
							setOpen(false);
							setFormValues({});
							setSubmited(false)
						}}
						className="w-full h-screen absolute z-[100] top-0 left-0 "
					></div>

					<motion.div
						onClick={(e) => e.preventDefault()}
						initial={{ opacity: 1, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							delay: 0.2,
							duration: 0.2,
							scale: {
								type: "spring",
								damping: 50,
								stiffness: 400,
							},
						}}
						className="bg-white p-8 w-[95%] lg:!w-6/12 fixed  left-[2.5%] lg:!left-[25%] top-[calc(50%-120px)] z-[101] pt-12  overflow-auto rounded-lg border-b-4 border-b-success "
					>
						<span className="absolute top-6 right-6 duration-200 ease-in-out hover:rotate-90 cursor-pointer p-2">
							<IconClose
								stroke="black"
								onClick={() => {
									setOpen(false);
									setFormValues({});
									setSubmited(false)
								}}
								className=""
								width={16}
								height={16}
								viewBox="0 0 16 16"
							/>
						</span>
						<div className="container">
							<div className="flex flex-col items-center gap-6">
								<IconSuccess stroke="#07a034" height={108} width={108} />
								<div className="font-medium">{text}</div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</>
	);
};
