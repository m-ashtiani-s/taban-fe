"use client";

import { useState } from "react";
import { IconRequired, IconUpload } from "@/app/_components/icon/icons";
import PassportPicker from "@/app/_components/common/passportPicker/passportPicker";
import UploadBox from "@/app/_components/common/uploadBox/uploadBox";
import AuthModal from "@/app/_components/common/authModal/authModal";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { passportFolderName } from "@/utils/string";
import { useProfiletore } from "@/stores/profile";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import StepHeader from "../../stepHeader/stepHeader";

export default function PassportStep() {
	const { order, setOrder } = useNewOrderStore();
	const profile = useProfiletore((s) => s.profile);
	const profileLoading = useProfiletore((s) => s.loading);
	const [authOpen, setAuthOpen] = useState<boolean>(false);

	// کاربر مهمان: فایل‌ها در پوشه‌ی شناسه‌ی تصادفیِ همین سفارش ذخیره می‌شوند
	const scope = profile?.userId || order?.uploadScope || "";
	const setPassports = (urls: string[]) => setOrder((prev) => ({ ...prev, passports: urls }));

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="پاسپورت"
				subtitle="پاسپورت‌های مربوط به این سفارش را انتخاب یا بارگذاری کنید"
				icon={<IconUpload viewBox="0 0 32 32" width={26} height={26} className="stroke-0 fill-current" />}
			/>

			<div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
				{profileLoading ? (
					<div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
						<TabanLoading size={24} />
						در حال بررسی حساب کاربری...
					</div>
				) : profile ? (
					// کاربر واردشده: انتخاب از لیست پاسپورت‌های خودش
					<PassportPicker value={order?.passports ?? []} onChange={setPassports} />
				) : (
					// مهمان: پیشنهاد ورود برای دیدن پاسپورت‌های قبلی + امکان بارگذاری مستقیم
					<>
						<div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div className="text-sm text-primary leading-7">
								اگر حساب کاربری دارید، با ورود می‌توانید پاسپورت‌هایی را که قبلاً ثبت کرده‌اید انتخاب کنید. در
								غیر این صورت، می‌توانید تصویر پاسپورت را همین‌جا بارگذاری کنید.
							</div>
							<TabanButton onClick={() => setAuthOpen(true)} className="shrink-0">
								ورود به حساب
							</TabanButton>
						</div>

						<UploadBox
							value={order?.passports ?? []}
							onChange={setPassports}
							folder={passportFolderName(scope)}
							hint="تصویر پاسپورت خود را اینجا رها کنید یا انتخاب نمایید"
						/>

						<AuthModal
							open={authOpen}
							setOpen={setAuthOpen}
							title="ورود به حساب"
							description="با ورود، پاسپورت‌های ثبت‌شده‌ی شما برای انتخاب نمایش داده می‌شوند."
							onSuccess={() => setAuthOpen(false)}
						/>
					</>
				)}

				{/* هینت تأکیدی روی دقت پاسپورت برای اسپل‌چک */}
				<div className="flex items-start gap-2 text-xs text-neutral-600 bg-secondary/5 border border-secondary/20 rounded-xl p-3.5">
					<IconRequired viewBox="0 0 100 100" width={16} height={16} className="fill-secondary stroke-0 shrink-0 mt-0.5" />
					<span className="leading-6">
						تصویر پاسپورت‌ها مبنای «اسپل‌چک» و درج صحیح اسپلینگ نام‌ها در ترجمه است؛ تصویری واضح و خوانا انتخاب یا بارگذاری کنید.
					</span>
				</div>
			</div>
		</div>
	);
}
