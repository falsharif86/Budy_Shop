import type { ApiClient } from './client.js';
import type { ProductResponse } from './types.js';
import type { Product } from '$lib/types/product.js';

export function mapProductResponse(r: ProductResponse): Product {
	return {
		id: r.id,
		sku: r.sku,
		price: r.price,
		cost: r.cost,
		stockLevel: r.stockLevel,
		mainImageUrl: r.mainImageUrl,
		isByWeight: r.isByWeight,
		isDeleted: r.isDeleted,
		approvalStatus: r.approvalStatus,
		unit: r.unit,
		tenantId: r.tenantId,
		productCategoryId: r.productCategoryId,
		productSubCategoryId: r.productSubCategoryId,
		productClassificationId: r.productClassificationId,
		strainId: r.strainId,
		weight: r.weight,
		unitsPerPack: r.unitsPerPack,
		creationTime: r.creationTime,
		lastModificationTime: r.lastModificationTime,
		variants: (r.variants ?? []).map((v) => ({
			id: v.id,
			productId: v.productId,
			sku: v.sku,
			name: v.name ?? 'Standard',
			price: v.price,
			cost: v.cost,
			weight: v.weight,
			weightUnit: v.weightUnit,
			stockLevel: v.stockQuantity,
			isDefault: v.isDefault,
			isActive: v.isActive,
			isByWeight: v.isByWeight,
			unit: v.unit,
			sortOrder: v.sortOrder,
			attributes: (v.attributes ?? []).map((a) => ({
				id: a.id,
				variantId: a.variantId,
				attributeKey: a.attributeKey,
				languageCode: a.languageCode,
				compositeKey: a.compositeKey,
				textValue: a.textValue,
				numberValue: a.numberValue,
				boolValue: a.boolValue,
				isDeleted: a.isDeleted
			}))
		})),
		images: (r.images ?? []).map((i) => ({
			id: i.id,
			productId: i.productId,
			variantId: i.variantId,
			fileName: i.fileName,
			filePath: i.filePath,
			mimeType: i.mimeType,
			fileSize: i.fileSize,
			sortOrder: i.sortOrder,
			isMain: i.isMain,
			imageType: i.imageType,
			altText: i.altText,
			width: i.width,
			height: i.height,
			isBgRemoved: i.isBgRemoved,
			isDeleted: i.isDeleted ?? false
		})),
		attributes: (r.attributes ?? [])
			.filter((a) => !a.isDeleted)
			.map((a) => ({
				id: a.id,
				productId: a.productId,
				attributeKey: a.attributeKey,
				languageCode: a.languageCode,
				compositeKey: a.compositeKey,
				textValue: a.textValue,
				numberValue: a.numberValue,
				boolValue: a.boolValue,
				isDeleted: a.isDeleted
			})),
		tags: (r.productTags ?? []).map((t) => ({
			id: t.id,
			productId: t.productId,
			tag: t.tag,
			languageCode: t.languageCode,
			source: t.source
		}))
	};
}

export async function fetchProducts(
	api: ApiClient,
	options: { skip?: number; limit?: number } = {}
): Promise<Product[]> {
	const { skip = 0, limit = 100 } = options;
	const data = await api.get<ProductResponse[]>(
		'/api/app/tenant-products/shop',
		{ skipCount: skip, maxResultCount: limit }
	);
	return (Array.isArray(data) ? data : []).map(mapProductResponse);
}

export async function fetchProductBySku(
	api: ApiClient,
	sku: string
): Promise<Product | null> {
	try {
		const data = await api.get<ProductResponse>(`/api/app/tenant-products/shop/by-sku/${encodeURIComponent(sku)}`);
		return data ? mapProductResponse(data) : null;
	} catch {
		return null;
	}
}
