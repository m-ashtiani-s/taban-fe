import { UserType } from "@/types/profile.type";

export type UpdateUserPayload = {
	profilePic?: string;
	nationalId?: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	userType?: UserType;
	requiredLanguages?: string[];
	specialtyField?: string;
	referralSource?: string;
	referralCode?: string;
};
