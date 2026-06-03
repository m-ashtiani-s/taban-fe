export type Customer = {
	customerId: string;
	firstName: string;
	lastName: string;
	fullName: string;
	nationalId: string;
	phoneNumber: string;
	provinceName: string;
	provinceCode: number;
	cityName: string;
	cityCode: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CustomerFilters = {
	term?: string;
	provinceCode?: number;
	cityCode?: number;
	isActive?: boolean;
};

export type CustomerPayload = {
	firstName: string;
	lastName: string;
	nationalId: string;
	phoneNumber: string;
	provinceName: string;
	provinceCode: number;
	cityName: string;
	cityCode: number;
	isActive?: boolean;
};
