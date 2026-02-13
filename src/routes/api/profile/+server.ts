import { json, type RequestEvent } from '@sveltejs/kit';
import { createApiClient, ApiError } from '$lib/api/client.js';

export async function GET({ locals }: RequestEvent) {
	if (!locals.tenant || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	try {
		const result = await api.get('/api/tenants/tenant-pos/member-profile');
		return json(result);
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ error: err.statusText }, { status: err.status });
		}
		console.error('Profile fetch failed:', err);
		return json({ error: 'Failed to load profile' }, { status: 500 });
	}
}
