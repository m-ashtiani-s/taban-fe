export type ShippingAddress = {
	shippingAddressId: string;
	title: string;
	provinceName: string;
	provinceCode: number;
	cityName: string;
	cityCode: number;
	postalCode: string;
	plaque: string | null;
	unit: string | null;
	fullAddress: string;
	addressDescription: string | null;
	landlineNumber: string | null;
	isActive: boolean;
	user: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ShippingAddressFilters = {
	term?: string;
	provinceCode?: number;
	cityCode?: number;
	isActive?: boolean;
};

export type ShippingAddressPayload = {
	title: string;
	provinceName: string;
	provinceCode: number;
	cityName: string;
	cityCode: number;
	postalCode: string;
	plaque?: string | null;
	unit?: string | null;
	fullAddress: string;
	addressDescription?: string | null;
	landlineNumber?: string | null;
	isActive?: boolean;
};
