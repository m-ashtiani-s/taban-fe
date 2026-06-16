export type InvoiceStatus = "created" | "issued" | "paid" | "canceled";
export type InvoiceReferenceType = "order";
export type InvoiceIssuerType = "system" | "admin";

export type InvoiceItem = {
	title: string;
	quantity: number;
	unitPrice: number;
	total: number;
};

export type Invoice = {
	invoiceId: string;
	invoiceNumber: number;
	referenceType: InvoiceReferenceType | null;
	referenceId: string | null;
	referenceNumber: number | null;
	subject: string;
	description: string | null;
	items: InvoiceItem[];
	subtotal: number;
	vatRate: number;
	vatAmount: number;
	totalAmount: number;
	status: InvoiceStatus;
	issuerType: InvoiceIssuerType;
	paidAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type InvoiceFilters = {
	status?: InvoiceStatus;
};
