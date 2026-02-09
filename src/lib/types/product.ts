export interface Product {
	id: string;
	sku: string;
	price: number;
	cost: number;
	stockLevel: number;
	mainImageUrl: string | null;
	isByWeight: boolean;
	isDeleted: boolean;
	approvalStatus: number;
	unit: number;
	tenantId: string;
	productCategoryId: string | null;
	productSubCategoryId: string | null;
	productClassificationId: string | null;
	strainId: string | null;
	weight: number | null;
	unitsPerPack: number | null;
	creationTime: string;
	lastModificationTime: string | null;
	variants: ProductVariant[];
	images: ProductImage[];
	attributes: ProductAttribute[];
	tags: ProductTag[];
}

export interface ProductVariant {
	id: string;
	productId: string;
	sku: string;
	name: string;
	price: number;
	cost: number;
	weight: number | null;
	weightUnit: string | null;
	stockLevel: number;
	isDefault: boolean;
	isActive: boolean;
	isByWeight: boolean;
	unit: number;
	sortOrder: number;
	attributes: VariantAttribute[];
}

export interface ProductImage {
	id: string;
	productId: string;
	variantId: string | null;
	fileName: string;
	filePath: string;
	mimeType: string;
	fileSize: number;
	sortOrder: number;
	isMain: boolean;
	imageType: number;
	altText: string | null;
	width: number | null;
	height: number | null;
	isBgRemoved: boolean;
	isDeleted: boolean;
}

export interface ProductAttribute {
	id: string;
	productId: string;
	attributeKey: string;
	languageCode: string;
	compositeKey: string;
	textValue: string;
	numberValue: number | null;
	boolValue: boolean | null;
	isDeleted: boolean;
}

export interface VariantAttribute {
	id: string;
	variantId: string;
	attributeKey: string;
	languageCode: string;
	compositeKey: string;
	textValue: string;
	numberValue: number | null;
	boolValue: boolean | null;
	isDeleted: boolean;
}

export interface ProductTag {
	id: string;
	productId: string;
	tag: string;
	languageCode: string;
	source: string;
}

export function isInStock(product: Product): boolean {
	if (product.variants.length > 0) {
		return product.variants.some((v) => v.isActive && v.stockLevel > 0);
	}
	return product.stockLevel > 0;
}

export function isApproved(product: Product): boolean {
	return product.approvalStatus === 1;
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
