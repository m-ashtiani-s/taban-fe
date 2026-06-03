import { Language } from "./language.type";

export type UserType = "individual" | "legal";
export type CustomerType = "NORMAL" | "ENTERPRISE";

export type Profile = {
	userId: string;
	username: string;
	role: string;
	profilePic?: string;
	isActive: boolean;
	customerType?: CustomerType;
	firstName?: string;
	lastName?: string;
	fullName?: string;
	nationalId?: string;
	phoneNumber?: string;
	userType?: UserType | null;
	requiredLanguages?: Language[];
	specialtyField?: string;
	referralSource?: string;
	referralCode?: string;
	ownReferralCode?: string;
};
