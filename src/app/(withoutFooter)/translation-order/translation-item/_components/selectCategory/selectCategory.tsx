import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { SelectCategoryProps } from "./selectCategory.type";
import { useApi } from "@/hooks/useApi";
import { useEffect } from "react";
import { TranslationEndpoints } from "../../../_api/endpoints";

export default function SelectCategory({ selectedCategory, setSelectedCategory }: SelectCategoryProps) {
	const { result: translationItemsCategories, fetchData: executeTranslationItemsCategories } = useApi(
		async () => await TranslationEndpoints.getCategories()
	);

	useEffect(() => {
		executeTranslationItemsCategories();
	}, []);
	return (
		<div className="pt-10">
			<div className="w-full border-b border-secondary/80 border-dashed flex gap-2 justify-center">
				<TabanButton
					variant="bordered"
					onClick={() => setSelectedCategory(null)}
					className={`!rounded-t-lg !rounded-b-none !transform-none !border-b-[0px] font-medium !border-secondary hover:bg-secondary/10 ${selectedCategory === null ? "!bg-secondary !font-bold !text-white hover:!bg-secondary" : "!text-secondary "}`}
				>
					همه مدارک
				</TabanButton>
				{translationItemsCategories?.success &&
					translationItemsCategories?.data?.data?.map((it) => (
						<TabanButton
							key={it?.translationItemCategoryId}
							onClick={() => setSelectedCategory(it)}
							variant="bordered"
							className={`!rounded-t-lg !rounded-b-none !transform-none !border-b-[0px] font-medium !border-secondary hover:bg-secondary/10 ${selectedCategory?.translationItemCategoryId === it?.translationItemCategoryId ? "!bg-secondary !font-bold !text-white hover:!bg-secondary" : "!text-secondary "}`}
						>
							{it?.title}
						</TabanButton>
					))}
			</div>
		</div>
	);
}
