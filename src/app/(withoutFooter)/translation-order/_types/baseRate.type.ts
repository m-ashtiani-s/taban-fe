export type BaseRate = {
	baseRateId: string;
	translationItemId: string;
	translationItemName: string;
	translationItemIsActive:boolean;
	languageId: string;
	languageName: string;
	languageIsActive:boolean;
	basePrice: number | string;
	title:string
};
