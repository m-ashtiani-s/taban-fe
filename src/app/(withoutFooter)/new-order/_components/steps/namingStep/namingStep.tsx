"use client";

import { motion } from "framer-motion";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { IconDocument } from "@/app/_components/icon/icons";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import StepHeader from "../../stepHeader/stepHeader";

export default function NamingStep() {
	const { order, setOrder } = useNewOrderStore();
	const count = order?.translationItemCount ?? 1;
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);
	// پلیس‌هولدرِ نام مدرک که ادمین برای این مدرک تعریف کرده است
	const namePlaceholder = order?.translationItem?.namePlaceholder?.trim() || undefined;

	const setNames = (updater: any) => {
		setOrder((prev) => {
			const current = prev?.translationItemNames ?? {};
			return { ...prev, translationItemNames: typeof updater === "function" ? updater(current) : updater };
		});
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="مدارک خود را نام‌گذاری کنید"
				subtitle="با یک نام دلخواه، تشخیص مدارک در مراحل بعدی برای شما ساده‌تر می‌شود"
			/>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7 max-w-3xl mx-auto w-full">
				{keys.map((key, index) => {
					const value = names[key] ?? "";
					const hasError = !value.trim();
					return (
						<motion.div
							key={key}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.05 }}
							className="flex flex-col gap-1"
						>
							<div className="">{`نام مدرک شماره ${index + 1}`}</div>
							<TabanInput
								value={value}
								name={key}
								setValue={setNames}
								groupMode
								placeholder={namePlaceholder}
								leadingIcon={<IconDocument width={20} height={20} className="fill-secondary stroke-0" />}
								isHandleError
								hasError={hasError}
								errorText={hasError ? "وارد کردن نام مدرک الزامی است" : ""}
							/>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
