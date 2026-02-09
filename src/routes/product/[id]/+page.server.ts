import type { PageServerLoad } from './$types.js';
import { createApiClient } from '$lib/api/client.js';
import { fetchProductDetails } from '$lib/api/products.js';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.tenant) {
		error(404, 'Shop not found');
	}

	const api = createApiClient(locals.tenant.id);
	const product = await fetchProductDetails(api, params.id);

	if (!product) {
		error(404, 'Product not found');
	}

	return { product };
};
