"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { TranslationEndpoints } from "@/app/_api/translationEndpoints";
import { TranslationItem } from "@/types/translationItem.type";
import { Language } from "@/types/language.type";
import { ResultError } from "@/types/result";
import { IconArrow, IconArrowLine, IconDocument, IconTranslate } from "@/app/_components/icon/icons";
import TabanAutoComplete from "@/app/_components/common/tabanAutoComplete/tabanAutoComplete";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { useNotificationStore } from "@/stores/notification.store";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";

export default function HeroOrderStart() {
	const router = useRouter();
	const showNotification = useNotificationStore((s) => s.showNotification);
	const [selectedItem, setSelectedItem] = useState<TranslationItem | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
	const [count, setCount] = useState(1);
	const [checkingRate, setCheckingRate] = useState(false);

	const queryClient = useQueryClient();

	const itemsQuery = useQuery({
		queryKey: ["translation", "items"],
		queryFn: () => withMappedError(() => TranslationEndpoints.getTranslationItems()),
		meta: { showNotification: true },
	});

	const languagesQuery = useQuery({
		queryKey: ["translation", "languages"],
		queryFn: () => withMappedError(() => TranslationEndpoints.getLanguages()),
		meta: { showNotification: true },
	});

	const itemsList = itemsQuery.data?.data ?? [];
	const languagesList = languagesQuery.data?.data ?? [];

	const toggleLanguage = (lang: Language) => {
		setSelectedLanguage((prev) => (prev?.languageId === lang.languageId ? null : lang));
	};

	const goToOrder = () => {
		if (!selectedItem) return;
		const params = new URLSearchParams({ item: selectedItem.translationItemId });
		if (selectedLanguage) params.set("lang", selectedLanguage.languageId);
		if (count > 1) params.set("count", String(count));
		router.push(`/new-order?${params.toString()}`);
	};

	const handleContinue = async () => {
		if (!selectedItem) return;
		if (!selectedLanguage) {
			goToOrder();
			return;
		}
		setCheckingRate(true);
		try {
			const filters = { translationItemId: selectedItem.translationItemId, languageId: selectedLanguage.languageId };
			const res = await queryClient.fetchQuery({
				queryKey: ["translation", "baseRate", filters],
				queryFn: () => withMappedError(() => TranslationEndpoints.getBaseRate(filters)),
			});
			if (res?.data?.[0]) {
				goToOrder();
			} else {
				showNotification({
					type: "error",
					message: "برای این مدرک و زبان نرخی تعریف نشده است؛ لطفاً زبان دیگری انتخاب کنید.",
				});
			}
		} catch (err) {
			showNotification({ type: "error", message: (err as ResultError).description });
		} finally {
			setCheckingRate(false);
		}
	};

	return (
		<div className="bg-white shadow-xl shadow-primary/5 border border-suppliment rounded-3xl p-6 lg:p-9 -mt-20 ">
			{/* سرتیتر */}
			<div className="flex flex-col gap-1 border-b-2 border-dashed border-neutral-200 pb-5 mb-7">
				<div className="peyda font-bold text-xl lg:text-2xl text-primary">همین الان ترجمه خود را شروع کنید</div>
				<div className="peyda font-medium text-secondary">مدرک و زبان مورد نظر خود را انتخاب کنید و ادامه دهید</div>
			</div>

			<div className="flex flex-col gap-8">
				{/* ۱) مدرک */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-2.5 text-sm font-semibold text-neutral-700 peyda">
						<span className="w-6 h-6 rounded-full bg-secondary/15 text-secondary text-xs flex items-center justify-center shrink-0">
							۱
						</span>
						مدرک مورد نظر را انتخاب کنید
					</div>

					<TabanAutoComplete<TranslationItem>
						scrolled
						height={240}
						hasLeading
						placeholder="نام مدرک را جستجو کنید..."
						name="document"
						options={itemsList}
						selectedOption={selectedItem}
						setSelectedOption={setSelectedItem}
						loading={itemsQuery.isPending}
						valueField="translationItemId"
						displayField="title"
						renderItem={(opt) => (
							<div className="flex items-center gap-2 py-2.5 px-1 cursor-pointer">
								<IconDocument strokeWidth={0} className="fill-neutral-400 w-5 h-5 shrink-0" />
								<span className="text-sm">{opt?.title}</span>
							</div>
						)}
					/>

					{/* استپر تعداد فقط پس از انتخاب مدرک نمایش داده می‌شود */}
					{selectedItem && (
						<motion.div
							initial={{ opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className="flex items-center gap-3 flex-wrap"
						>
							<span className="text-sm text-neutral-600 peyda">تعداد {selectedItem.title} برای ترجمه:</span>
							<div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 p-1">
								<TabanButton
									variant="icon"
									className="!h-8 !min-w-8 !bg-secondary/15"
									onClick={() => setCount((c) => c + 1)}
								>
									<IconArrow className="stroke-secondary fill-secondary" width={18} height={18} />
								</TabanButton>
								<span className="w-8 text-center peyda font-bold text-primary">
									{convertToPersianNumber(count)}
								</span>
								<TabanButton
									variant="icon"
									className="!h-8 !min-w-8 !bg-secondary/15"
									disabled={count === 1}
									onClick={() => setCount((c) => Math.max(1, c - 1))}
								>
									<IconArrow className="stroke-secondary fill-secondary rotate-180" width={18} height={18} />
								</TabanButton>
							</div>
						</motion.div>
					)}
				</section>

				{/* ۲) زبان */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-2.5 text-sm font-semibold text-neutral-700 peyda">
						<span className="w-6 h-6 rounded-full bg-secondary/15 text-secondary text-xs flex items-center justify-center shrink-0">
							۲
						</span>
						زبان ترجمه را انتخاب کنید
					</div>

					{languagesQuery.isPending ? (
						<div className="flex items-center gap-2 text-xs text-neutral-400 py-1">
							<TabanLoading size={16} /> در حال دریافت زبان‌ها...
						</div>
					) : (
						<div className="flex flex-wrap gap-2.5">
							{languagesList.map((lang) => {
								const active = selectedLanguage?.languageId === lang.languageId;
								return (
									<button
										key={lang.languageId}
										onClick={() => toggleLanguage(lang)}
										className={`flex items-center gap-2 text-sm peyda rounded-xl border px-3.5 py-2 duration-200 ${
											active
												? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
												: "border-neutral-200 text-neutral-600 hover:border-primary/40 hover:bg-primary/[0.04]"
										}`}
									>
										<span className="w-6 h-6 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
											<Image
												width={24}
												height={24}
												alt={lang.languageName}
												src={`/images/languages/${lang.languageCode}.png`}
											/>
										</span>
										{lang.languageName}
									</button>
								);
							})}
						</div>
					)}
				</section>
			</div>

			{/* اقدام */}
			<div className="flex items-center justify-between gap-4 mt-8 pt-5 border-t border-dashed border-neutral-200 max-lg:!flex-col-reverse max-lg:!items-stretch">
				<div className="text-xs lg:text-sm text-neutral-400 flex items-center gap-1.5 max-lg:!justify-center">
					<IconTranslate strokeWidth={0} className="fill-secondary w-4 h-4 shrink-0" />
					{selectedItem
						? selectedLanguage
							? `${selectedItem.title} · ${selectedLanguage.languageName} · ${convertToPersianNumber(count)} عدد`
							: "زبان ترجمه را می‌توانید در مرحله‌ی بعد هم انتخاب کنید"
						: "ابتدا مدرک مورد نظر خود را انتخاب کنید"}
				</div>
				<TabanButton
					onClick={handleContinue}
					disabled={!selectedItem || checkingRate}
					isLoading={checkingRate}
					icon={<IconArrowLine />}
					className="max-lg:!w-full max-lg:!justify-center"
				>
					ادامه ثبت سفارش
				</TabanButton>
			</div>
		</div>
	);
}
