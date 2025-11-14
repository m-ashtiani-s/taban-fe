export type Profile = {
	userId: string;
	username: string;
	role: string;
	profilePic?: string;
	isActive: boolean;
	firstName?: string;
	lastName?: string;
	fullName?: string;
	birthDate?: string;
	email?: string;
	gender?: string;
	provinceId?: number | null;
	provinceName?: string;
	cityId?: number | null;
	cityName?: string;
	referralSource?: string;
};
