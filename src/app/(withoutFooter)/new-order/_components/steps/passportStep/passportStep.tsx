"use client";

import { IconRequired, IconUpload } from "@/app/_components/icon/icons";
import PassportPicker from "@/app/_components/common/passportPicker/passportPicker";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import StepHeader from "../../stepHeader/stepHeader";

export default function PassportStep() {
	const { order, setOrder } = useNewOrderStore();

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="پاسپورت"
				subtitle="پاسپورت‌های مربوط به این سفارش را از لیست خود انتخاب کنید"
				icon={<IconUpload viewBox="0 0 32 32" width={26} height={26} className="stroke-0 fill-current" />}
			/>

			<div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
				<PassportPicker
					value={order?.passports ?? []}
					onChange={(urls) => setOrder((prev) => ({ ...prev, passports: urls }))}
				/>

				{/* هینت تأکیدی روی دقت پاسپورت برای اسپل‌چک */}
				<div className="flex items-start gap-2 text-xs text-neutral-600 bg-secondary/5 border border-secondary/20 rounded-xl p-3.5">
					<IconRequired viewBox="0 0 100 100" width={16} height={16} className="fill-secondary stroke-0 shrink-0 mt-0.5" />
					<span className="leading-6">
						تصویر پاسپورت‌ها مبنای «اسپل‌چک» و درج صحیح اسپلینگ نام‌ها در ترجمه است؛ هنگام افزودن پاسپورت، تصویری واضح و خوانا بارگذاری کنید.
					</span>
				</div>
			</div>
		</div>
	);
}
