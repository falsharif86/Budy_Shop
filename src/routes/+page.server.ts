import type { PageServerLoad } from './$types.js';
import { createApiClient } from '$lib/api/client.js';
import { fetchProducts } from '$lib/api/products.js';
import { fetchCategories } from '$lib/api/categories.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) {
		return { products: [], categories: [] };
	}

	const api = createApiClient(locals.tenant.id);

	try {
		const [productResult, categories] = await Promise.all([
			fetchProducts(api),
			fetchCategories(api)
		]);

		return { products: productResult.items, categories };
	} catch (error) {
		console.error('Failed to load shop data:', error);
		return { products: [], categories: [] };
	}
};
