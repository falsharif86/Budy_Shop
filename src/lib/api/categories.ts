import type { ApiClient } from './client.js';
import type { CategoryResponse, SubCategoryResponse } from './types.js';
import type { Category, SubCategory, CategoryTranslations } from '$lib/types/category.js';

function parseTranslations(raw: string | null): CategoryTranslations | null {
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function mapCategory(r: CategoryResponse): Category {
	return {
		id: r.id,
		name: r.name,
		displayName: r.displayName,
		description: r.description,
		iconUrl: r.iconUrl,
		orderIndex: r.orderIndex,
		isVisible: r.isVisible,
		masterProductCategoryId: r.masterProductCategoryId,
		translations: parseTranslations(r.translations)
	};
}

function mapSubCategory(r: SubCategoryResponse): SubCategory {
	return {
		id: r.id,
		name: r.name,
		displayName: r.displayName,
		productCategoryId: r.productCategoryId,
		iconUrl: r.iconUrl,
		orderIndex: r.orderIndex,
		isVisible: r.isVisible,
		masterProductSubCategoryId: r.masterProductSubCategoryId,
		translations: parseTranslations(r.translations)
	};
}

export async function fetchCategories(api: ApiClient): Promise<Category[]> {
	const data = await api.get<CategoryResponse[]>('/api/app/tenant-products/shop/categories');
	return (Array.isArray(data) ? data : [])
		.filter((c) => c.isVisible)
		.map(mapCategory)
		.sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function fetchSubCategories(api: ApiClient): Promise<SubCategory[]> {
	const data = await api.get<SubCategoryResponse[]>('/api/app/tenant-products/shop/sub-categories');
	return (Array.isArray(data) ? data : [])
		.filter((s) => s.isVisible)
		.map(mapSubCategory)
		.sort((a, b) => a.orderIndex - b.orderIndex);
}
