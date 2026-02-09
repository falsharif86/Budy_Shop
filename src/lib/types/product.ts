export interface Product {
	id: string;
	name: string;
	sku: string;
	price: number;
	cost: number;
	stockLevel: number;
	mainImageUrl: string | null;
	isByWeight: boolean;
	categoryId: string | null;
	categoryName: string | null;
	variantCount: number;
	hasVariants: boolean;
	variants: ProductVariant[];
}

export interface ProductDetail extends Product {
	description: string | null;
	unit: number;
	subCategoryId: string | null;
	subCategoryName: string | null;
	images: ProductImage[];
}

export interface ProductVariant {
	id: string;
	name: string | null;
	sku: string;
	price: number;
	cost: number;
	weight: number | null;
	weightUnit: string | null;
	stockLevel: number;
	isDefault: boolean;
	isActive: boolean;
}

export interface ProductImage {
	id: string;
	filePath: string;
	isMain: boolean;
	sortOrder: number;
}

export function isInStock(product: Product): boolean {
	if (product.variants.length > 0) {
		return product.variants.some((v) => v.isActive && v.stockLevel > 0);
	}
	return product.stockLevel > 0;
}

export function getEffectivePrice(product: Product): number {
	const defaultVariant = product.variants.find((v) => v.isDefault && v.isActive);
	if (defaultVariant) return defaultVariant.price;
	const firstActive = product.variants.find((v) => v.isActive);
	if (firstActive) return firstActive.price;
	return product.price;
}

export function getEffectiveStock(product: Product): number {
	if (product.variants.length > 0) {
		return product.variants.filter((v) => v.isActive).reduce((sum, v) => sum + v.stockLevel, 0);
	}
	return product.stockLevel;
}
