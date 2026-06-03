"use client";

import { IconRequired, IconUpload } from "@/app/_components/icon/icons";
import StepHeader from "../../stepHeader/stepHeader";
import UploadBox from "../../uploadBox/uploadBox";

const REQUIREMENTS = [
	"تصویر صفحه‌ی اصلی پاسپورت با اطلاعات هویتی خوانا",
	"فرمت‌های مجاز: PDF، JPG و PNG",
	"اسپلینگ صحیح نام در ترجمه بر اساس همین تصویر انجام می‌شود",
	"از واضح بودن و بدون انعکاس بودن تصویر اطمینان حاصل کنید",
];

export default function PassportStep() {
	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="آپلود تصویر پاسپورت"
				subtitle="برای درج صحیح اسپلینگ نام‌ها، تصویر پاسپورت را بارگذاری کنید"
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

				<UploadBox target="passports" folder="passport" hint="تصویر پاسپورت خود را اینجا رها کنید یا انتخاب نمایید" />
			</div>
		</div>
	);
}
