"use client";

import { IconRequired, IconUpload } from "@/app/_components/icon/icons";
import StepHeader from "../../stepHeader/stepHeader";
import UploadBox from "../../uploadBox/uploadBox";

const REQUIREMENTS = [
	"تصویر یا اسکن واضح و خوانا از تمامی صفحات مدرک",
	"فرمت‌های مجاز: PDF، JPG و PNG",
	"اطمینان از کامل و بدون قطعی بودن تصویر مدرک",
	"هر مدرک را به‌صورت جداگانه و با کیفیت مناسب بارگذاری کنید",
];

export default function UploadStep() {
	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="آپلود مدارک"
				subtitle="تصویر مدارکی که قصد ترجمه‌ی آن‌ها را دارید بارگذاری کنید"
				icon={<IconUpload viewBox="0 0 32 32" width={26} height={26} className="stroke-0 fill-current" />}
			/>

			<div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
				<div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-5">
					<div className="flex items-center gap-2 peyda font-bold text-primary mb-3">
						<IconRequired viewBox="0 0 100 100" width={22} height={22} className="fill-secondary stroke-0" />
						نکات بارگذاری
					</div>
					<div className="flex flex-col gap-2.5">
						{REQUIREMENTS.map((text) => (
							<div key={text} className="flex items-center gap-2 text-sm text-neutral-500">
								<span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
								{text}
							</div>
						))}
					</div>
				</div>

				<UploadBox target="assets" hint="فایل‌های مدرک خود را اینجا رها کنید یا انتخاب نمایید" />
			</div>
		</div>
	);
}
