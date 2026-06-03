"use client";

import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconArrowLine } from "@/app/_components/icon/icons";
import CompleteProfileForm from "./_components/completeProfileForm/completeProfileForm";

export default function Page() {
	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl lg:text-2xl font-bold peyda text-primary">تکمیل پروفایل</h1>
					<p className="text-sm text-neutral-500 mt-1">
						برای ثبت سفارش ترجمه، تکمیل پروفایل الزامیه. لطفا اطلاعات زیر را با دقت پر کنید.
					</p>
				</div>
				<TabanButton variant="icon" isLink href="/profile" className="max-md:!hidden">
					<IconArrowLine className="rotate-180" height={24} width={24} />
				</TabanButton>
			</div>
			<CompleteProfileForm />
		</div>
	);
}
