import { json, type RequestEvent } from '@sveltejs/kit';
import { createApiClient, ApiError } from '$lib/api/client.js';

export async function POST({ request, locals }: RequestEvent) {
	if (!locals.tenant) {
		return json({ error: 'Tenant not found' }, { status: 404 });
	}

	const api = createApiClient(locals.tenant.id);

	try {
		const body = await request.json();
		const result = await api.post('/api/tenants/tenant-pos/online-order', body);
		return json(result);
	} catch (err) {
		if (err instanceof ApiError) {
			return json(
				{ error: `Order failed: ${err.statusText}` },
				{ status: err.status }
			);
		}
		console.error('Order creation failed:', err);
		return json(
			{ error: 'Failed to place order. Please try again.' },
			{ status: 500 }
		);
	}
}
