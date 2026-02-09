import type { PageServerLoad } from './$types.js';
import { createApiClient } from '$lib/api/client.js';
import { fetchProducts } from '$lib/api/products.js';
import { fetchCategories, fetchSubCategories } from '$lib/api/categories.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.tenant) {
		return { products: [], categories: [], subCategories: [] };
	}

	const api = createApiClient(locals.tenant.id);

	try {
		const [products, categories, subCategories] = await Promise.all([
			fetchProducts(api, { limit: 200 }),
			fetchCategories(api),
			fetchSubCategories(api)
		]);

		return { products, categories, subCategories };
	} catch (error) {
		console.error('Failed to load shop data:', error);
		return { products: [], categories: [], subCategories: [] };
	}
};
