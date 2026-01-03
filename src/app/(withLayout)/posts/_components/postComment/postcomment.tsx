"use client";
import { createData } from "@/core/http-service/http-service";
import { useNotificationStore } from "@/stores/notification.store";
import { useEffect, useState } from "react";
import { SuccessPopup } from "./successPopup";
import { WP_URL } from "@/config/global";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanTextarea from "@/app/_components/common/tabanTextarea/tabanTextarea";

type Errors = {
	item: string;
	message: string;
};

export default function PostComment({ id }: { id: number }) {
	const [formValues, setFormValues] = useState<any>({});
	const [errors, setErrors] = useState<Errors[]>([]);
	const [submited, setSubmited] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [disabled, setDisabled] = useState<boolean>(false);
	const showNotification = useNotificationStore((state) => state.showNotification);
	const [open, setOpen] = useState<boolean>(false);

	const compliantSubmitHandler = () => {
		setSubmited(true);
		const newErrors: Errors[] = [];
		!formValues?.fullName && newErrors.push({ item: `fullName`, message: "نام و نام خانوادگی الزامی است" });
		setErrors(newErrors);
		if (newErrors?.length === 0) {
			let data: any = {};

			data.post_id = id;
			data.author_name = formValues?.fullName;
			data.author_email = formValues?.email;
			data.content = formValues?.remarks;

			submitForm(data);
		} else {
			setDisabled(true);
		}
	};

	function findError(itemName: string) {
		const item = errors.find((obj) => obj.item === itemName);
		return item || null;
	}

	useEffect(() => {
		if (submited) {
			const newErrors: Errors[] = [];
			!formValues?.fullName && newErrors.push({ item: `fullName`, message: "نام و نام خانوادگی الزامی است" });

			setErrors(newErrors);
			if (newErrors?.length === 0) {
				setDisabled(false);
			} else {
				setDisabled(true);
			}
		}
	}, [formValues]);

	const submitForm = async (data: any) => {
		try {
			setLoading(true);
			const res = await createData<any, any>(`${WP_URL}/wp-json/custom/v1/submit-comment`, data);
			setOpen(true);
		} catch (error: any) {
			showNotification({
				message: error?.message || "ثبت نظر با خطا مواجه شد",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className="mt-4">
			<SuccessPopup
				open={open}
				setOpen={setOpen}
				text="نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد"
				setFormValues={setFormValues}
				setSubmited={setSubmited}
			/>
			<div className="flex justify-between flex-col lg:!flex-row gap-6">
				<div className="w-full  flex flex-col">
					<TabanInput
						value={formValues?.fullName}
						setValue={setFormValues}
						name="fullName"
						groupMode
						className="w-full p-2 border rounded-lg"
						placeholder="نام و نام خانوادگی *"
					/>
					{!!findError(`fullName`) && <div className="text-error text-xs mt-1">{findError(`fullName`)?.message}</div>}
				</div>
				<div className="w-full flex gap-2 flex-col">
					<TabanInput
						value={formValues?.email}
						setValue={setFormValues}
						name="email"
						groupMode
						className="w-full p-2 border rounded-lg"
						placeholder="ایمیل"
					/>
				</div>
			</div>
			<div className="flex justify-between w-full mt-6 flex-col">
				<TabanTextarea
					value={formValues?.remarks}
					setValue={setFormValues}
					name="remarks"
					groupMode
					className="w-full p-2 border rounded-lg"
					placeholder="توضیحات تکمیلی"
				/>
			</div>
			<div className="flex justify-end w-full mt-6">
				<TabanButton disabled={loading || disabled} isLoading={loading} onClick={compliantSubmitHandler} loadingText="ثبت فرم">
					ثبت نظر
				</TabanButton>
			</div>
		</div>
	);
}
