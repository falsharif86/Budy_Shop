import type { ApiClient } from './client.js';
import type { PagedResult, PosProductDto, PosProductDetailDto } from './types.js';
import type { Product, ProductDetail } from '$lib/types/product.js';

function mapProduct(dto: PosProductDto): Product {
	return {
		id: dto.id,
		name: dto.name,
		sku: dto.sku,
		price: dto.price,
		cost: dto.cost,
		stockLevel: dto.stockLevel,
		mainImageUrl: dto.mainImageUrl,
		isByWeight: dto.isByWeight,
		categoryId: dto.categoryId,
		categoryName: dto.categoryName,
		variantCount: dto.variantCount,
		hasVariants: dto.hasVariants,
		variants: (dto.variants ?? []).map((v) => ({
			id: v.id,
			name: v.name,
			sku: v.sku,
			price: v.price,
			cost: v.cost,
			weight: v.weight,
			weightUnit: v.weightUnit,
			stockLevel: v.stockLevel,
			isDefault: v.isDefault,
			isActive: v.isActive
		}))
	};
}

function mapProductDetail(dto: PosProductDetailDto): ProductDetail {
	const variants = (dto.variants ?? []).map((v) => ({
		id: v.id,
		name: v.name,
		sku: v.sku,
		price: v.price,
		cost: v.cost,
		weight: v.weight,
		weightUnit: v.weightUnit,
		stockLevel: v.stockLevel,
		isDefault: v.isDefault,
		isActive: v.isActive
	}));

	return {
		id: dto.id,
		name: dto.name,
		sku: dto.sku,
		price: dto.price,
		cost: dto.cost,
		stockLevel: dto.stockLevel,
		mainImageUrl: dto.mainImageUrl,
		isByWeight: dto.isByWeight,
		categoryId: dto.categoryId,
		categoryName: dto.categoryName,
		variantCount: variants.length,
		hasVariants: variants.length > 0,
		variants,
		description: dto.description,
		unit: dto.unit,
		subCategoryId: dto.subCategoryId,
		subCategoryName: dto.subCategoryName,
		images: (dto.images ?? []).map((i) => ({
			id: i.id,
			filePath: i.filePath,
			isMain: i.isMain,
			sortOrder: i.sortOrder
		}))
	};
}

export async function fetchProducts(
	api: ApiClient,
	options: { skip?: number; limit?: number; categoryId?: string; search?: string } = {}
): Promise<{ items: Product[]; totalCount: number }> {
	const { skip = 0, limit = 100, categoryId, search } = options;
	const data = await api.get<PagedResult<PosProductDto>>(
		'/api/tenants/tenant-pos/products',
		{ skipCount: skip, maxResultCount: limit, categoryId, search }
	);
	return {
		items: (data.items ?? []).map(mapProduct),
		totalCount: data.totalCount ?? 0
	};
}

export async function fetchProductDetails(
	api: ApiClient,
	productId: string
): Promise<ProductDetail | null> {
	try {
		const data = await api.get<PosProductDetailDto>(
			`/api/tenants/tenant-pos/product-details/${encodeURIComponent(productId)}`
		);
		return data ? mapProductDetail(data) : null;
	} catch {
		return null;
	}
}
