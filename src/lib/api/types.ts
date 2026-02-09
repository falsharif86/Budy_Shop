/** Paginated result from TenantPos API */
export interface PagedResult<T> {
	items: T[];
	totalCount: number;
}

/** Product list DTO from /api/tenants/tenant-pos/products */
export interface PosProductDto {
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
	variants: PosProductVariantDto[];
}

/** Product detail DTO from /api/tenants/tenant-pos/product-details */
export interface PosProductDetailDto {
	id: string;
	name: string;
	description: string | null;
	sku: string;
	price: number;
	cost: number;
	stockLevel: number;
	mainImageUrl: string | null;
	isByWeight: boolean;
	unit: number;
	categoryId: string | null;
	categoryName: string | null;
	subCategoryId: string | null;
	subCategoryName: string | null;
	variants: PosProductVariantDto[];
	images: PosProductImageDto[];
}

/** Variant DTO */
export interface PosProductVariantDto {
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

/** Image DTO */
export interface PosProductImageDto {
	id: string;
	filePath: string;
	isMain: boolean;
	sortOrder: number;
}

/** Category DTO from /api/tenants/tenant-pos/categories */
export interface PosCategoryDto {
	id: string;
	name: string;
	displayName: string | null;
	iconUrl: string | null;
	colorHex: string | null;
	sortOrder: number;
	productCount: number;
}
