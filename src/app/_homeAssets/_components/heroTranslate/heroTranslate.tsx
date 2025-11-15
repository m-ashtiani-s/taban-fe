"use client";
import { TabanEndpoints } from "@/app/_api/endpoints";
import TabanAutoComplete from "@/app/_components/common/tabanAutoComplete/tabanAutoComplete";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconArrow, IconDocument, IconRecycle } from "@/app/_components/icon/icons";
import { useApi } from "@/hooks/useApi";
import { useNotificationStore } from "@/stores/notification.store";
import { TranslationItem } from "@/types/translationItem.type";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TabanAutoCompleteCheckbox from "@/app/_components/common/tabanAutoCompleteCheckbox/tabanAutoCompleteCheckbox";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
type TranslationItemWithCount = TranslationItem & { count: number };

export default function HeroTranslate() {
	const [selectedTranslationItem, setSelectedTranslationItem] = useState<TranslationItem | null>(null);
	const [selectedTranslationItemsWithCount, setSelectedTranslationItemsWithCount] = useState<TranslationItemWithCount[]>([]);
	const mount = useRef<boolean>(false);
	const {
		result: translationItemsResult,
		resultData: translationItemsResultData,
		fetchData: executeTranslationItems,
		loading: translationItemsLoading,
	} = useApi(async (term: string) => await TabanEndpoints.getTranslationItems(term));

	useEffect(() => {
		executeTranslationItems("");
	}, []);

	useEffect(() => {
		if (selectedTranslationItem) {
			handleSelectTranslationItem(selectedTranslationItem);
		}
	}, [selectedTranslationItem]);

	useEffect(() => {
		if (translationItemsResult) {
			if (translationItemsResult?.success) {
				mount.current = true;
			} else {
			}
		}
	}, [translationItemsResult]);

	const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
		slides: { perView: "auto", spacing: 4 },
		mode: "free-snap",
	});

	useEffect(() => {
		if (instanceRef.current) {
			instanceRef.current.update();
		}
	}, [translationItemsResultData]);

	const handleSelectTranslationItem = (item: TranslationItem) => {
		if (!selectedTranslationItemsWithCount?.find((it) => it?.translationItemId === item?.translationItemId)) {
			setSelectedTranslationItemsWithCount((prev) => [...prev, { ...item, count: 1 }]);
		}
	};

	const increaseItemHandler = (item: TranslationItemWithCount) => {
		setSelectedTranslationItemsWithCount((prev) =>
			prev.map((it) => (it.translationItemId === item.translationItemId ? { ...it, count: it.count + 1 } : it))
		);
	};
	const decreaseItemHandler = (item: TranslationItemWithCount) => {
		setSelectedTranslationItemsWithCount((prev) =>
			prev.map((it) => (it.translationItemId === item.translationItemId ? { ...it, count: it.count - 1 } : it)).filter((it) => it.count > 0)
		);
	};

	return (
		<div className="bg-white shadow border border-suppliment rounded-2xl p-4 px-6 -mt-24">
			<div className="py-2 flex items-center peyda gap-2 border-b-2 border-dashed border-b-neutral-200 pb-4">
				<div className="font-semibold text-lg">همین الان ترجمه خود را شروع کنید</div>
				<div className="h-10 w-0.5 rounded-xl bg-secondary"></div>
				<div className="font-semibold text-lg text text-secondary">اسناد و مدارک مد نظر خود را انتخاب کنید</div>
			</div>
			<div className="py-8">
				<div className="flex gap-8 justify-between">
					<div className="w-8/12 flex flex-col gap-2 -mt-2">
						<TabanAutoComplete
							scrolled
							height={200}
							hasLeading
							renderItem={(opt) => (
								<div className="flex items-center gap-1 py-2 px-1 cursor-pointer">
									<IconDocument strokeWidth={0} className="fill-neutral-400" />
									{opt?.title}
								</div>
							)}
                            isShowValue={false}
							placeholder="مدرک مورد نظر را جستجو کنید یا انتخاب کنید"
							name="document"
							options={translationItemsResultData?.data ?? []}
							selectedOption={selectedTranslationItem}
							setSelectedOption={setSelectedTranslationItem}
							valueField="translationItemId"
							displayField="title"
						/>
						<div className="w-full flex gap-2 items-center">
							<TabanButton variant="icon" className="" onClick={() => instanceRef.current?.prev()}>
								<IconArrow className="rotate-90 fill-neutral-400" height={24} width={24} strokeWidth={0} />
							</TabanButton>
							<div className=" w-[calc(100%-96px)]" style={{ margin: "0 auto", position: "relative" }}>
								<div ref={sliderRef} className="keen-slider">
									{translationItemsResultData?.data?.map((item, idx) => (
										<div
											key={idx}
											onClick={() => handleSelectTranslationItem(item)}
											style={{ flex: "0 0 auto" }}
											className={`keen-slider__slide cursor-pointer whitespace-nowrap hover:bg-primary/5  hover:border-primary/20 !w-fit duration-200 !px-2 ${!!selectedTranslationItemsWithCount?.find((it) => it?.translationItemId === item?.translationItemId) ? "!bg-primary !text-white !border-primary hover:!bg-primary hover:!text-white hover:!border-primary" : "border-neutral-200"} border  h-6 flex items-center justify-center text-xs peyda rounded-full`}
										>
											{item?.title}
										</div>
									))}
								</div>
							</div>
							<TabanButton variant="icon" className="" onClick={() => instanceRef.current?.next()}>
								<IconArrow className="-rotate-90 fill-neutral-400" height={24} width={24} strokeWidth={0} />
							</TabanButton>
						</div>
					</div>
					<TabanButton>ادامه سفارش ترجمه</TabanButton>
				</div>
				<div className="flex flex-col gap-5 w-72 mt-6">
					{selectedTranslationItemsWithCount?.map((it) => (
						<div
							key={it?.translationItemId}
							className="flex items-center justify-between pb-1 px-1 border-b-neutral-300 border-b"
						>
							<div className="text-[13px] font-medium">{it?.title}</div>
							<div className="flex items-center gap-2">
								<div
									onClick={() => increaseItemHandler(it)}
									className=" h-[16px] w-[16px] cursor-pointer flex items-center justify-center bg-primary rounded text-xl leading-4 text-white"
								>
									+
								</div>
								<div className="text-[12px] font-medium relative top-[2px]">
									{convertToPersianNumber(it?.count)} عدد
								</div>
								{it?.count === 1 ? (
									<IconRecycle
										width={16}
										height={16}
										viewBox="0 0 589.004 589.004"
										className="fill-error cursor-pointer"
										onClick={() => decreaseItemHandler(it)}
									/>
								) : (
									<div
										onClick={() => decreaseItemHandler(it)}
										className=" h-[16px] w-[16px] cursor-pointer flex items-center justify-center bg-primary rounded text-xl leading-4 text-white"
									>
										-
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
