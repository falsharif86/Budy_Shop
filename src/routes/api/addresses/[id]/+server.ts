import { json, type RequestEvent } from '@sveltejs/kit';
import { createApiClient, ApiError } from '$lib/api/client.js';

export async function PUT({ request, params, locals }: RequestEvent) {
	if (!locals.tenant || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	try {
		const body = await request.json();
		const result = await api.put(`/api/app/tenant-pos/member-address`, { id: params.id, ...body });
		return json(result);
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ error: err.statusText }, { status: err.status });
		}
		console.error('Address update failed:', err);
		return json({ error: 'Failed to update address' }, { status: 500 });
	}
}

export async function DELETE({ params, locals }: RequestEvent) {
	if (!locals.tenant || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	try {
		await api.del(`/api/app/tenant-pos/member-address/${params.id}`);
		return json({ success: true });
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ error: err.statusText }, { status: err.status });
		}
		console.error('Address deletion failed:', err);
		return json({ error: 'Failed to delete address' }, { status: 500 });
	}
}
