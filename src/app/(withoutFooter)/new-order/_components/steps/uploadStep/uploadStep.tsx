"use client";

import { IconRequired, IconUpload } from "@/app/_components/icon/icons";
import UploadBox from "@/app/_components/common/uploadBox/uploadBox";
import DocumentDescriptionField from "@/app/_components/common/documentDescriptionField/documentDescriptionField";
import { assetFolderName } from "@/utils/string";
import { useProfile } from "@/hooks/useProfile";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import StepHeader from "../../stepHeader/stepHeader";
import DocumentSection from "../../documentSection/documentSection";

export default function UploadStep() {
	const { order, setOrder } = useNewOrderStore();
	const { profile } = useProfile();
	// ریشه‌ی پوشه: شناسه‌ی کاربر اگر وارد شده باشد، وگرنه شناسه‌ی تصادفیِ ثابتِ همین سفارش
	const scope = profile?.userId || order?.uploadScope || "";
	const names = order?.translationItemNames ?? {};
	const keys = Object.keys(names);
	// توضیحات آپلود که ادمین برای این مدرک نوشته است
	const uploadDescription = (order?.translationItem?.uploadDescription ?? "").trim();

	const setDocAssets = (docKey: string, urls: string[]) => {
		setOrder((prev) => ({
			...prev,
			assetsByDoc: { ...(prev?.assetsByDoc ?? {}), [docKey]: urls },
		}));
	};

	const setDocDescription = (docKey: string, description: string) => {
		setOrder((prev) => ({
			...prev,
			descriptionByDoc: { ...(prev?.descriptionByDoc ?? {}), [docKey]: description },
		}));
	};

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="آپلود مدارک"
				subtitle="تصویر مدارکی که قصد ترجمه‌ی آن‌ها را دارید، برای هر مدرک جداگانه بارگذاری کنید"
				icon={<IconUpload viewBox="0 0 32 32" width={26} height={26} className="stroke-0 fill-current" />}
			/>

			<div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
				{/* توضیحات آپلودِ نوشته‌شده توسط ادمین برای این مدرک */}
				{uploadDescription && (
					<div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-5">
						<div className="flex items-center gap-2 peyda font-bold text-primary mb-3">
							<IconRequired viewBox="0 0 100 100" width={22} height={22} className="fill-secondary stroke-0" />
							نکات بارگذاری مدارک
						</div>
						<div className="text-sm text-neutral-600 leading-7 whitespace-pre-line">{uploadDescription}</div>
					</div>
				)}

				{/* یادآوری درباره‌ی دریافت اصل مدارک توسط پیک */}
				<div className="flex items-start gap-2 text-xs text-neutral-600 bg-secondary/5 border border-secondary/20 rounded-xl p-3.5">
					<IconRequired viewBox="0 0 100 100" width={16} height={16} className="fill-secondary stroke-0 shrink-0 mt-0.5" />
					<span className="leading-6">
						این مدارک برای انجام ترجمه‌ی رسمی کافی نیست؛ پیک مجموعه برای دریافت اصل مدارک به محل شما مراجعه می‌کند و
						بارگذاری در این مرحله صرفاً برای افزایش سرعت ترجمه است.
					</span>
				</div>

				{/* باکس آپلود مجزا برای هر مدرک (هر مدرک در پوشه‌ی مخصوص خودش) */}
				<div className="flex flex-col gap-5">
					{keys.map((key, index) => (
						<DocumentSection key={key} index={index} title={names[key] ?? "مدرک"}>
							<UploadBox
								value={order?.assetsByDoc?.[key] ?? []}
								onChange={(urls) => setDocAssets(key, urls)}
								folder={assetFolderName(scope, names[key] ?? "")}
								hint="فایل‌های این مدرک را اینجا رها کنید یا انتخاب نمایید"
							/>
							<DocumentDescriptionField
								docTitle={names[key] ?? "مدرک"}
								value={order?.descriptionByDoc?.[key] ?? ""}
								onChange={(desc) => setDocDescription(key, desc)}
							/>
						</DocumentSection>
					))}
				</div>
			</div>
		</div>
	);
}
