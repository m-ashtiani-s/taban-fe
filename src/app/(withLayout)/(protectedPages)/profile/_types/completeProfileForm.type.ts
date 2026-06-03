import { UserType } from "@/types/profile.type";

export type CompleteProfileFormValues = {
	firstName?: string;
	lastName?: string;
	nationalId?: string;
	phoneNumber?: string;
	specialtyField?: string;
	referralCode?: string;
};

export type SelectedLanguage = {
	languageId: string;
	languageName: string;
};

export type UserTypeOption = {
	label: string;
	value: UserType;
};

export type ReferralSourceOption = {
	label: string;
	value: string;
};
