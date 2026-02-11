import { json, type RequestEvent } from '@sveltejs/kit';
import { createApiClient, ApiError } from '$lib/api/client.js';

export async function GET({ locals }: RequestEvent) {
	if (!locals.tenant || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	try {
		const result = await api.get('/api/app/tenant-pos/member-addresses');
		return json(result);
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ error: err.statusText }, { status: err.status });
		}
		console.error('Address list failed:', err);
		return json({ error: 'Failed to load addresses' }, { status: 500 });
	}
}

export async function POST({ request, locals }: RequestEvent) {
	if (!locals.tenant || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	try {
		const body = await request.json();
		const result = await api.post('/api/app/tenant-pos/member-address', body);
		return json(result);
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ error: err.statusText }, { status: err.status });
		}
		console.error('Address creation failed:', err);
		return json({ error: 'Failed to create address' }, { status: 500 });
	}
}
