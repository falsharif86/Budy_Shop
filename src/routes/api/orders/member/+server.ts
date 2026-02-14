import { json, type RequestEvent } from '@sveltejs/kit';
import { createApiClient, ApiError } from '$lib/api/client.js';

export async function GET({ url, locals }: RequestEvent) {
	if (!locals.tenant || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	const params: Record<string, string | number | undefined> = {};
	const skipCount = url.searchParams.get('SkipCount');
	const maxResultCount = url.searchParams.get('MaxResultCount');
	if (skipCount) params.SkipCount = skipCount;
	if (maxResultCount) params.MaxResultCount = maxResultCount;

	try {
		const result = await api.get('/api/tenants/tenant-pos/member-orders', params);
		return json(result);
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ error: err.statusText }, { status: err.status });
		}
		console.error('Member orders list failed:', err);
		return json({ error: 'Failed to load orders' }, { status: 500 });
	}
}
