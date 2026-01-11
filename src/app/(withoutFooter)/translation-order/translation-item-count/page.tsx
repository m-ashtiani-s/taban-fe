"use client";
import { useEffect, useRef, useState } from "react";
import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { TranslationItemCategory } from "../_types/translationItemCategory.type";
import SelectCategory from "./_components/selectCategory/selectCategory";
import { useApi } from "@/hooks/useApi";
import { IconArrow, IconArrowLine, IconDocument } from "@/app/_components/icon/icons";
import TabanLoading from "@/app/_components/common/tabanLoading.tsx/tabanLoading";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { motion } from "framer-motion";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { OrderState, useOrderStore } from "../_store/rate.store";
import TranslationItemsLoading from "./_components/translationItemsLoading/translationItemsLoading";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { TranslationEndpoints } from "../_api/endpoints";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { generateUUID } from "@/utils/string";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { FormErrors } from "@/types/formErrors.type";
import { useRouter } from "next/navigation";
import { findError } from "@/utils/formErrorsFinder";

export default function Page() {
	const router = useRouter();
	const { order, setOrder }: OrderState = useOrderStore();
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [formSubmited, setFormSubmited] = useState<boolean>(false);
	const [translationItemsNames, setTranslationItemsNames] = useState<Record<string, string>>({});
	const mount = useRef(false);
	useEffect(() => {
		if (order?.translationItemCount && order?.translationItemCount > 1) {
			const items: Record<string, string> = {};
			Array.from({ length: order?.translationItemCount }).map((_, index) => {
				items[generateUUID()] = `${order?.translationItem?.title} شماره ${index + 1}`;
			});
			setTranslationItemsNames(items);
		} else if (order?.translationItemCount === 1) {
			setTranslationItemsNames({[generateUUID()]:`${order?.translationItem?.title} شماره 1`})
		}
	}, []);

	useEffect(() => {
		setOrder((prev) => ({ ...prev, translationItemNames: translationItemsNames }));
		if (formSubmited) {
			formValidator();
		}
	}, [translationItemsNames]);

	const formHandler = () => {
		setFormSubmited(true);
		const errors = formValidator();
		if (errors?.length === 0) {
			router.push("/translation-order/language");
		}
	};

	const formValidator = () => {
		const newErrors: FormErrors[] = [];
		if (order?.translationItemCount && order?.translationItemCount > 1) {
			Object.keys(translationItemsNames)?.map((it: string, index: number) => {
				!!!translationItemsNames[it] && newErrors.push({ item: it, message: "وارد کردن نام مدرک الزامی است" });
			});
		} else if (order?.translationItemCount === 1) {
		}
		setFormErrors(newErrors);

		newErrors?.length > 0 ? setFormDisabled(true) : setFormDisabled(false);
		return newErrors;
	};

	return (
		<div className="h-full">
			<div className="container h-full">
				<div className="flex border w-full border-neutral-300 rounded-lg p-4 h-[calc(100%-16px)] flex-col">
					<div className="flex flex-col h-[calc(100%-40px)] taban-scroll">
						<div className=" flex items-center gap-2 w-full px-8 pb-16 border-b border-dashed border-neutral-300">
							<CreateRateLevels activeLevel={1} />
						</div>
						<div className="pt-8">
							<div className="peyda font-extrabold text-3xl text-neutral-500 text-center w-full">
								مدارک خود را نام‌گذاری کنید
							</div>
						</div>

						<div className="mt-4">
							<div className="flex flex-col gap-6 ">
								{Object.keys(translationItemsNames).map((item, index) => (
									<div className="">
										<div className="w-[380px]">
											<TabanInput
												key={item}
												value={translationItemsNames[item]}
												name={item}
												setValue={setTranslationItemsNames}
												groupMode
												label={`نام مدرک شماره ${index + 1}`}
												isHandleError
												hasError={!!findError(formErrors, item)}
												errorText={findError(formErrors, item)?.message}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="flex items-center justify-end gap-2 pt-2 bg-white">
						<TabanButton disabled={formDisabled} onClick={formHandler} icon={<IconArrowLine />}>
							مرحله بعدی
						</TabanButton>
					</div>
				</div>
			</div>
		</div>
	);
}
