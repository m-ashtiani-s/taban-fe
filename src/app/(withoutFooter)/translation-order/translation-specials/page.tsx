"use client";
import { useEffect, useState } from "react";
import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { useApi } from "@/hooks/useApi";
import { IconArrowLine, IconDocument } from "@/app/_components/icon/icons";
import TabanLoading from "@/app/_components/common/tabanLoading.tsx/tabanLoading";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { motion } from "framer-motion";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import { OrderState, useOrderStore } from "../_store/rate.store";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { RateFilters } from "../_types/rateFilters.type";
import SpecialsLoading from "./_components/specialsLoading/specialsLoading";
import { TranslationEndpoints } from "../_api/endpoints";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import { SpecialItemsValue } from "../_types/createOrder.type";

export default function Page() {
	const { order, setOrder }: OrderState = useOrderStore();
	const [specialItems, setSpecialItems] = useState<Record<string, string>>({});
	const {
		result: dynamicRatesResult,
		fetchData: executeDynamicRates,
		loading: dynamicRatesLoading,
	} = useApi(async (filters: RateFilters | null) => {
		return await TranslationEndpoints.getDynamicRates(filters);
	});

	const createSpecialItem = () => {
		const specials: SpecialItemsValue[] = [];
		Object.keys(specialItems)?.map((it) => {
			if (dynamicRatesResult?.success) {
				const rate = dynamicRatesResult?.data?.data?.filter((r) => r?.dynamicRateId === it)[0];
				specials.push({
					count: +specialItems[it],
					dynamicRateId: it,
					price: rate!?.price,
					label: rate!?.label,
				});
			}
		});
		setOrder((prev) => ({ ...prev, specialItems: specials }));
	};

	useEffect(() => {
		createSpecialItem();
	}, [specialItems]);

	useEffect(() => {
		if (order?.language && order?.translationItem) {
			executeDynamicRates({ translationItemId: order?.translationItem?.translationItemId, languageId: order?.language?.languageId });
		}
	}, []);

	return (
		<div className="h-full">
			<div className="container h-full">
				<div className="flex border w-full border-neutral-300 rounded-lg p-4 h-[calc(100%-16px)] flex-col">
					<div className="flex flex-col h-[calc(100%-40px)] taban-scroll">
						<div className=" flex items-center gap-2 w-full px-8 pb-16 border-b border-dashed border-neutral-300">
							<CreateRateLevels activeLevel={3} />
						</div>

						<div className="mt-4">
							{dynamicRatesLoading ? (
								<SpecialsLoading />
							) : !!dynamicRatesResult?.success && dynamicRatesResult?.data?.data!?.length > 0 ? (
								<div className="flex flex-col gap-6">
									{dynamicRatesResult?.data?.data?.map((it, index) => (
										<motion.div
											className="p-2 w-3/12"
											key={it?.dynamicRateId}
											initial={{ opacity: 0, y: 12 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												duration: 0.5,
												ease: "easeOut",
												delay: index * 0.05,
											}}
										>
											<div className="flex flex-col gap-2">
												<div className="peyda font-bold text-xl text-neutral-500">
													{it?.label}
												</div>
												<div className="flex gap-2 items-center">
													<div className="w-64">
														<TabanInput
															isNumber
															type="number"
															value={specialItems[it?.dynamicRateId]}
															groupMode
															setValue={setSpecialItems}
															name={it?.dynamicRateId}
														/>
													</div>
													<div className="group relative">
														<span className="text-lg min-w-6 h-6 bg-secondary rounded-full flex items-center justify-center pt-2 text-white font-bold">
															?
														</span>
														<div className="bg-white border border-neutral-200 rounded-lg p-4 z-10 top-8 w-64 absolute right-0 invisible group-hover:!visible opacity-0 group-hover:!opacity-100 duration-200">
															{it?.label}
														</div>
													</div>
												</div>
											</div>
										</motion.div>
									))}
								</div>
							) : !!dynamicRatesResult && !dynamicRatesResult?.success && isRetryAble(dynamicRatesResult?.code) ? (
								<div className="flex justify-center gap-4 items-start mt-8 bg-white">
									<ErrorComponent
										executeFunction={() =>
											executeDynamicRates({
												translationItemId: order?.translationItem?.translationItemId,
												languageId: order?.language?.languageId,
											})
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
						<TabanButton isLink href="/translation-order/language" variant="text">
							مرحله قبلی
						</TabanButton>
						<TabanButton
							disabled={!order?.language}
							isLink
							href={"/translation-order/translation-certifications"}
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
