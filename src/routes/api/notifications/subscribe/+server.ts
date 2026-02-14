import { json, type RequestEvent } from '@sveltejs/kit';
import { createApiClient, ApiError } from '$lib/api/client.js';

export async function POST({ request, locals }: RequestEvent) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	if (!locals.tenant) {
		return json({ error: 'Tenant not found' }, { status: 404 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	try {
		const body = await request.json();
		await api.post('/api/notifications/register-device-token', {
			deviceToken: body.token,
			platform: 'web',
			appType: 'shop',
			memberId: body.memberId || locals.user.id
		});
		return json({ success: true });
	} catch (err) {
		if (err instanceof ApiError) {
			return json(
				{ error: `Registration failed: ${err.statusText}` },
				{ status: err.status }
			);
		}
		console.error('Notification subscribe failed:', err);
		return json(
			{ error: 'Failed to register for notifications' },
			{ status: 500 }
		);
	}
}

export async function DELETE({ request, locals }: RequestEvent) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	if (!locals.tenant) {
		return json({ error: 'Tenant not found' }, { status: 404 });
	}

	const api = createApiClient(locals.tenant.id, locals.user.accessToken);

	try {
		const body = await request.json();
		await api.post('/api/notifications/unregister-device-token', {
			deviceToken: body.token
		});
		return json({ success: true });
	} catch (err) {
		if (err instanceof ApiError) {
			return json(
				{ error: `Unregister failed: ${err.statusText}` },
				{ status: err.status }
			);
		}
		console.error('Notification unsubscribe failed:', err);
		return json(
			{ error: 'Failed to unregister notifications' },
			{ status: 500 }
		);
	}
}
