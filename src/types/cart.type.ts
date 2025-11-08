export type Cart = {
	cartId: string;
	products: ProductInCart[];
	cartSum: number;
	cartSumWithDiscount: number;
	createdAt: string;
	updatedAt: string;
};

export type ProductInCart = {
	productId: string;
	title: string;
	featuredImage: string;
	price: number;
	priceWithDiscount: number;
	discount: number;
	quantity: number;
	stockQuantity: number;
};
