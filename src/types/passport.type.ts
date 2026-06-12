export type Passport = {
	passportId: string;
	title: string;
	image: string;
	isActive: boolean;
	user: string | null;
	createdAt: string;
	updatedAt: string;
};

export type PassportPayload = {
	title: string;
	image: string;
	isActive?: boolean;
};

export type PassportFilters = {
	term?: string;
	isActive?: boolean;
};
