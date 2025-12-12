"use client";
import { useEffect, useRef, useState } from "react";
import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { TranslationItemCategory } from "../_types/translationItemCategory.type";
import SelectCategory from "./_components/selectCategory/selectCategory";
import { useApi } from "@/hooks/useApi";
import { IconArrowLine, IconDocument } from "@/app/_components/icon/icons";
import TabanLoading from "@/app/_components/common/tabanLoading.tsx/tabanLoading";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { motion } from "framer-motion";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { OrderState, useOrderStore } from "../_store/rate.store";
import TranslationItemsLoading from "./_components/translationItemsLoading/translationItemsLoading";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { TranslationEndpoints } from "../_api/endpoints";

export default function Page() {
	const [selectedCategory, setSelectedCategory] = useState<TranslationItemCategory | null>(null);
	const { order, setOrder }: OrderState = useOrderStore();
	const mount = useRef(false);
	const {
		result: translationItemsResult,
		fetchData: executeTranslationItems,
		loading: translationItemsLoading,
	} = useApi(async (translationItemCategoryId?: string) => await TranslationEndpoints.getTranslationItems(translationItemCategoryId), true);

	useEffect(() => {
		executeTranslationItems(selectedCategory?.translationItemCategoryId ?? undefined);
		mount.current && setOrder((prev) => ({ ...prev, translationItem: null }));
		setTimeout(() => {
			mount.current = true;
		}, 100);
	}, [selectedCategory]);
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
								قصد ترجمه چه مدرکی دارید؟
							</div>
							<SelectCategory selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
						</div>

						<div className="mt-4">
							{translationItemsLoading ? (
								<TranslationItemsLoading />
							) : !!translationItemsResult?.success && translationItemsResult?.data?.data!?.length > 0 ? (
								<div className="flex flex-wrap ">
									{translationItemsResult?.data?.data?.map((it, index) => (
										<motion.div
											className="p-2 w-3/12"
											key={it?.translationItemId}
											initial={{ opacity: 0, y: 12 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												duration: 0.5,
												ease: "easeOut",
												delay: index * 0.05,
											}}
										>
											<div
												onClick={() => {
													setOrder((prev) => ({ ...prev, translationItem: it }));
												}}
												className={`border border-neutral-300 rounded-lg cursor-pointer flex items-center justify-between p-4  duration-300 ${order?.translationItem?.translationItemId === it?.translationItemId ? "bg-secondary" : "hover:bg-secondary/10"}`}
											>
												<div
													className={`flex items-center gap-2 peyda font-semibold  ${order?.translationItem?.translationItemId === it?.translationItemId ? "text-white" : ""}`}
												>
													<IconDocument
														className={`fill-primary  ${order?.translationItem?.translationItemId === it?.translationItemId ? "fill-white stroke-1 stroke-white" : "stroke-0"}`}
													/>
													{it?.title}
												</div>
												<div
													className={`w-2 h-2 rounded-full border border-primary  ${order?.translationItem?.translationItemId === it?.translationItemId ? "!bg-white !border-white" : ""}`}
												></div>
											</div>
										</motion.div>
									))}
								</div>
							) : !!translationItemsResult &&
							  !translationItemsResult?.success &&
							  isRetryAble(translationItemsResult?.code) ? (
								<div className="flex justify-center gap-4 items-start mt-8 bg-white">
									<ErrorComponent
										executeFunction={() =>
											executeTranslationItems(
												selectedCategory?.translationItemCategoryId ?? undefined
											)
										}
										ticketAble
										errorText="دریافت لیست مدارک با خطا مواجه شد."
									/>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-14 gap-4">
									<div className=" text-sm">داده‌ای موجود نیست</div>
								</div>
							)}
						</div>
					</div>
					<div className="flex items-center justify-end gap-2 pt-2 bg-white">
						<TabanButton
							disabled={!order?.translationItem}
							isLink
							href="/translation-order/language"
							icon={<IconArrowLine />}
						>
							مرحله بعدی
						</TabanButton>
					</div>
				</div>
			</div>
		</div>
	);
}
