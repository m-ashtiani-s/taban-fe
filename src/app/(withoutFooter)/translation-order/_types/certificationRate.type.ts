export type CertificationRate = {
	certificationRateId: string;
	translationItemId: string;
	translationItemName: string;
	translationItemIsActive:boolean;
	languageId: string;
	languageName: string;
	languageIsActive:boolean;
	mfaPrice: number | string;
	justicePrice: number | string;
};
