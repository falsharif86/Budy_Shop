import type { ApiClient } from './client.js';
import type { PosCategoryDto } from './types.js';
import type { Category } from '$lib/types/category.js';

function mapCategory(dto: PosCategoryDto): Category {
	return {
		id: dto.id,
		name: dto.name,
		displayName: dto.displayName,
		iconUrl: dto.iconUrl,
		colorHex: dto.colorHex,
		sortOrder: dto.sortOrder,
		productCount: dto.productCount
	};
}

export async function fetchCategories(api: ApiClient): Promise<Category[]> {
	const data = await api.get<PosCategoryDto[]>('/api/tenants/tenant-pos/categories');
	return (Array.isArray(data) ? data : [])
		.map(mapCategory)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}
