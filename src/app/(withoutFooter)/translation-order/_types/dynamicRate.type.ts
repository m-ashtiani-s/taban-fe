export type DynamicRate = {
	dynamicRateId: string;
	translationItemId: string;
	translationItemName: string;
	translationItemIsActive:boolean;
	languageId: string;
	languageName: string;
	languageIsActive:boolean;
	price: number | string;
	label: string;
};