"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { isRetryAble } from "@/httpClient/utils/isRetryAble";
import { IconArrow, IconDocument } from "@/app/_components/icon/icons";
import ErrorComponent from "@/app/_components/errorComponent/errorComponent";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { TranslationItem } from "@/types/translationItem.type";
import { TranslationItemCategory } from "@/types/translationItemCategory.type";
import { useNewOrderStore } from "../../../_store/newOrder.store";
import StepHeader from "../../stepHeader/stepHeader";
import SelectCard from "../../selectCard/selectCard";
import CardsSkeleton from "../../cardsSkeleton/cardsSkeleton";

type SelectItemStepProps = {
	onSelectItem: (item: TranslationItem) => void;
};

export default function SelectItemStep({ onSelectItem }: SelectItemStepProps) {
	const { order, setOrder } = useNewOrderStore();
	const [selectedCategory, setSelectedCategory] = useState<TranslationItemCategory | null>(null);

	const categoriesQuery = useQuery({
		queryKey: ["translationCategories", "list"],
		queryFn: () => withMappedError(() => TranslationEndpoints.getCategories()),
		retry: false,
	});
	const itemsQuery = useQuery({
		queryKey: ["translationItems", "list", selectedCategory?.translationItemCategoryId ?? null],
		queryFn: () => withMappedError(() => TranslationEndpoints.getTranslationItems(selectedCategory?.translationItemCategoryId ?? undefined)),
		retry: false,
	});

	const changeCount = (delta: number) => {
		setOrder((prev) => ({
			...prev,
			translationItemCount: Math.max(1, (prev?.translationItemCount ?? 1) + delta),
		}));
	};

	const itemsList = itemsQuery.data?.data ?? [];

	return (
		<div className="flex flex-col gap-8">
			<StepHeader
				title="قصد ترجمه چه مدرکی دارید؟"
				subtitle="دسته‌بندی مورد نظر را انتخاب و سپس مدرک خود را برگزینید"
			/>

			{/* تب دسته‌بندی‌ها */}
			<div className="flex flex-wrap items-center justify-center gap-2">
				<button
					onClick={() => setSelectedCategory(null)}
					className={`px-4 py-2 rounded-full text-sm peyda font-medium border transition-all duration-200 ${
						selectedCategory === null
							? "bg-secondary border-secondary text-white"
							: "border-neutral-200 text-neutral-500 hover:border-secondary/50"
					}`}
				>
					همه مدارک
				</button>
				{categoriesQuery.data?.data?.map((cat) => (
						<button
							key={cat.translationItemCategoryId}
							onClick={() => setSelectedCategory(cat)}
							className={`px-4 py-2 rounded-full text-sm peyda font-medium border transition-all duration-200 ${
								selectedCategory?.translationItemCategoryId === cat.translationItemCategoryId
									? "bg-secondary border-secondary text-white"
									: "border-neutral-200 text-neutral-500 hover:border-secondary/50"
							}`}
						>
							{cat.title}
						</button>
					))}
			</div>

			{/* گرید مدارک */}
			{itemsQuery.isFetching ? (
				<CardsSkeleton count={8} />
			) : itemsList.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{itemsList.map((item, index) => {
						const isSelected = order?.translationItem?.translationItemId === item.translationItemId;
						return (
							<motion.div
								key={item.translationItemId}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
							>
								<SelectCard
									selected={isSelected}
									onClick={() => onSelectItem(item)}
									icon={<IconDocument width={26} height={26} />}
									title={item.title}
									indicator={isSelected ? "none" : "radio"}
									trailing={
										isSelected ? (
											<div className="flex items-center gap-1">
												<TabanButton
													variant="icon"
													className="!h-7 !min-w-7 !bg-secondary/15"
													onClick={() => changeCount(1)}
												>
													<IconArrow className="stroke-secondary fill-secondary" width={18} height={18} />
												</TabanButton>
												<span className="w-7 text-center peyda font-bold text-primary">
													{convertToPersianNumber(order?.translationItemCount ?? 1)}
												</span>
												<TabanButton
													variant="icon"
													className="!h-7 !min-w-7 !bg-secondary/15"
													disabled={(order?.translationItemCount ?? 1) === 1}
													onClick={() => changeCount(-1)}
												>
													<IconArrow className="stroke-secondary fill-secondary rotate-180" width={18} height={18} />
												</TabanButton>
											</div>
										) : undefined
									}
								/>
							</motion.div>
						);
					})}
				</div>
			) : !!itemsQuery.error && isRetryAble(itemsQuery.error.code) ? (
				<ErrorComponent
					executeFunction={() => itemsQuery.refetch()}
					ticketAble
					errorText="دریافت لیست مدارک با خطا مواجه شد."
				/>
			) : (
				<div className="text-center text-sm text-neutral-400 py-10">داده‌ای موجود نیست</div>
			)}
		</div>
	);
}
