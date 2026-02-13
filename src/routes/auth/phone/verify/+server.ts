import { json, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { setSession } from '$lib/server/auth.js';
import { extractSessionFromToken } from '$lib/server/token-utils.js';

export async function POST({ request, locals, cookies }: RequestEvent) {
	if (!locals.tenant) {
		return json({ success: false, error: 'Tenant not found' }, { status: 404 });
	}

	let body: { verificationId?: string; pin?: string };
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid request body' }, { status: 400 });
	}

	const { verificationId, pin } = body;
	if (!verificationId || !pin) {
		return json({ success: false, error: 'Missing verification ID or PIN' }, { status: 400 });
	}

	const apiBaseUrl = env.VITE_API_BASE_URL ?? 'https://api.budy.app';

	try {
		const tokenResponse = await fetch(`${apiBaseUrl}/connect/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'phone_pin',
				verification_id: verificationId,
				pin,
				client_id: 'Budy_Shop',
				tenant_name: locals.tenant.name,
				scope: 'offline_access Budy'
			}).toString()
		});

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.json().catch(() => null);
			const errorDesc =
				errorData?.error_description ?? 'Verification failed. Please try again.';
			return json({ success: false, error: errorDesc }, { status: 401 });
		}

		const tokenData = await tokenResponse.json();
		const session = extractSessionFromToken(tokenData, locals.tenant.id);

		if (!session) {
			return json(
				{ success: false, error: 'Failed to parse authentication token.' },
				{ status: 500 }
			);
		}

		setSession(cookies, session);

		const isNewUser = /^\+?\d{8,15}$/.test(session.name);

		return json({
			success: true,
			redirectTo: isNewUser ? '/auth/setup-profile' : '/',
			user: {
				id: session.userId,
				email: session.email,
				name: session.name,
				roles: session.roles
			}
		});
	} catch (err) {
		console.error('Phone verify error:', err);
		return json(
			{ success: false, error: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
}
