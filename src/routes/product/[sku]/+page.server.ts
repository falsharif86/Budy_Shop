import type { PageServerLoad } from './$types.js';
import { createApiClient } from '$lib/api/client.js';
import { fetchProductBySku } from '$lib/api/products.js';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.tenant) {
		error(404, 'Shop not found');
	}

	const api = createApiClient(locals.tenant.id);
	const product = await fetchProductBySku(api, params.sku);

	if (!product) {
		error(404, 'Product not found');
	}

	return { product };
};
