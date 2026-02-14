import { json, type RequestEvent } from '@sveltejs/kit';
import { createApiClient, ApiError } from '$lib/api/client.js';

export async function GET({ locals }: RequestEvent) {
	if (!locals.tenant || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	try {
		const result = await api.get<{
			latitude?: number | null;
			longitude?: number | null;
		}>(`/api/host/tenant-details/by-tenant-id/${locals.tenant.id}`);

		return json({
			latitude: result?.latitude ?? null,
			longitude: result?.longitude ?? null
		});
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ error: err.statusText }, { status: err.status });
		}
		console.error('Tenant coordinates fetch failed:', err);
		return json({ error: 'Failed to load tenant coordinates' }, { status: 500 });
	}
}
