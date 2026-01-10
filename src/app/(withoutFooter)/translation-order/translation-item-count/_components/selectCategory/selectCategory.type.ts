import { Dispatch, SetStateAction } from "react";
import { TranslationItemCategory } from "../../../_types/translationItemCategory.type";

export type SelectCategoryProps = {
	selectedCategory: TranslationItemCategory | null;
	setSelectedCategory: Dispatch<SetStateAction<TranslationItemCategory | null>>;
};
