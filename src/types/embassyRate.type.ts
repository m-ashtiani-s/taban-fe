export type EmbassyRate = {
	embassyRateId: string;
	translationItemId: string;
	translationItemName: string;
	translationItemIsActive: boolean;
	embassyId: string;
	embassyName: string;
	embassyIsActive: boolean;
	isRequired: boolean;
	price: number | string;
};
