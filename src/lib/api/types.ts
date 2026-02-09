/** Raw API response shape for paginated results */
export interface PagedResult<T> {
	items: T[];
	totalCount: number;
}

/** Raw product response from /api/app/tenant-products */
export interface ProductResponse {
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
	variants: VariantResponse[];
	images: ImageResponse[];
	attributes: AttributeResponse[];
	productTags: TagResponse[];
}

export interface VariantResponse {
	id: string;
	productId: string;
	sku: string;
	name: string;
	price: number;
	cost: number;
	weight: number | null;
	weightUnit: string | null;
	stockQuantity: number;
	isDefault: boolean;
	isActive: boolean;
	isByWeight: boolean;
	unit: number;
	sortOrder: number;
	attributes: VariantAttributeResponse[];
}

export interface ImageResponse {
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

export interface AttributeResponse {
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

export interface VariantAttributeResponse {
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

export interface TagResponse {
	id: string;
	productId: string;
	tag: string;
	languageCode: string;
	source: string;
}

export interface CategoryResponse {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	iconUrl: string | null;
	orderIndex: number;
	isVisible: boolean;
	masterProductCategoryId: string | null;
	translations: string | null; // JSON string
}

export interface SubCategoryResponse {
	id: string;
	name: string;
	displayName: string;
	productCategoryId: string;
	iconUrl: string | null;
	orderIndex: number;
	isVisible: boolean;
	masterProductSubCategoryId: string | null;
	translations: string | null; // JSON string
}
