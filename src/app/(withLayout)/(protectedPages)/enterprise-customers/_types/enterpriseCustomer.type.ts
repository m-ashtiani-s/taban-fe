export type EnterpriseCustomer = {
	enterpriseCustomerId: string;
	institutionName: string;
	institutionAddress: string;
	registrationId: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type EnterpriseCustomerPayload = {
	institutionName: string;
	institutionAddress: string;
	registrationId?: string | null;
};
