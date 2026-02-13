import { json, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ request, locals }: RequestEvent) {
	if (!locals.tenant) {
		return json({ success: false, error: 'Tenant not found' }, { status: 404 });
	}

	let body: { phoneNumber?: string };
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid request body' }, { status: 400 });
	}

	const { phoneNumber } = body;
	if (!phoneNumber) {
		return json({ success: false, error: 'Missing phone number' }, { status: 400 });
	}

	const apiBaseUrl = env.VITE_API_BASE_URL ?? 'https://api.budy.app';

	try {
		const response = await fetch(`${apiBaseUrl}/api/auth/phone/request-pin`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				phoneNumber,
				tenantName: locals.tenant.name
			})
		});

		const result = await response.json();
		return json(result);
	} catch (err) {
		console.error('Phone PIN request error:', err);
		return json(
			{ success: false, error: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
}
