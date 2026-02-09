import type { Product, ProductVariant } from './product.js';

export interface CartItem {
	product: Product;
	variant: ProductVariant | null;
	quantity: number;
}

export function getCartItemPrice(item: CartItem): number {
	if (item.variant) return item.variant.price;
	return item.product.price;
}

export function getCartItemName(item: CartItem, getName: (p: Product) => string): string {
	const productName = getName(item.product);
	if (item.variant && item.variant.name !== 'Standard') {
		return `${productName} - ${item.variant.name}`;
	}
	return productName;
}

export function getCartItemId(item: CartItem): string {
	return item.variant ? `${item.product.id}:${item.variant.id}` : item.product.id;
}
