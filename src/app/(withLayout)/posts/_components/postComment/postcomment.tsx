"use client";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { useMutation } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { useEffect, useState } from "react";
import { SuccessPopup } from "./successPopup";
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
	const [disabled, setDisabled] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);

	const { mutate: submitComment, isPending: submitLoading } = useMutation({
		mutationFn: (data: { post_id: number; author_name: string; author_email?: string; content: string }) =>
			withMappedError(() => TabanEndpoints.submitComment(data)),
		onSuccess: () => setOpen(true),
	});

	const compliantSubmitHandler = () => {
		setSubmited(true);
		const newErrors: Errors[] = [];
		!formValues?.fullName && newErrors.push({ item: `fullName`, message: "نام و نام خانوادگی الزامی است" });
		setErrors(newErrors);
		if (newErrors?.length === 0) {
			submitComment({
				post_id: id,
				author_name: formValues?.fullName,
				author_email: formValues?.email,
				content: formValues?.remarks,
			});
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

	return (
		<div className="mt-4">
			<SuccessPopup open={open} setOpen={setOpen} text="نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد" setFormValues={setFormValues} setSubmited={setSubmited} />
			<div className="flex justify-between flex-col lg:!flex-row gap-6">
				<div className="w-full  flex flex-col">
					<TabanInput value={formValues?.fullName} setValue={setFormValues} name="fullName" groupMode className="w-full p-2 border rounded-lg" placeholder="نام و نام خانوادگی *" />
					{!!findError(`fullName`) && <div className="text-error text-xs mt-1">{findError(`fullName`)?.message}</div>}
				</div>
				<div className="w-full flex gap-2 flex-col">
					<TabanInput value={formValues?.email} setValue={setFormValues} name="email" groupMode className="w-full p-2 border rounded-lg" placeholder="ایمیل" />
				</div>
			</div>
			<div className="flex justify-between w-full mt-6 flex-col">
				<TabanTextarea value={formValues?.remarks} setValue={setFormValues} name="remarks" groupMode className="w-full p-2 border rounded-lg" placeholder="توضیحات تکمیلی" />
			</div>
			<div className="flex justify-end w-full mt-6">
				<TabanButton disabled={submitLoading || disabled} isLoading={submitLoading} onClick={compliantSubmitHandler} loadingText="ثبت فرم">
					ثبت نظر
				</TabanButton>
			</div>
		</div>
	);
}
