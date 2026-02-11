import { json, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { setSession } from '$lib/server/auth.js';

export async function POST({ request, locals, cookies }: RequestEvent) {
	if (!locals.tenant) {
		return json({ success: false, error: 'Tenant not found' }, { status: 404 });
	}

	let body: { idToken?: string };
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid request body' }, { status: 400 });
	}

	const { idToken } = body;
	if (!idToken) {
		return json({ success: false, error: 'Missing idToken' }, { status: 400 });
	}

	const apiBaseUrl = env.VITE_API_BASE_URL ?? 'https://api.budy.app';

	try {
		// Exchange Google ID token with backend for access token
		const tokenResponse = await fetch(`${apiBaseUrl}/connect/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Tenant-Id': locals.tenant.id
			},
			body: new URLSearchParams({
				grant_type: 'google_id_token',
				id_token: idToken,
				client_type: 'shop',
				client_id: 'Budy_Shop',
				tenant_name: locals.tenant.name,
				scope: 'offline_access Budy'
			}).toString()
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			console.error('Token exchange failed:', tokenResponse.status, errorText);
			return json(
				{ success: false, error: 'Authentication failed. Please try again.' },
				{ status: 401 }
			);
		}

		const tokenData = await tokenResponse.json();
		const accessToken: string = tokenData.access_token;
		const refreshToken: string | undefined = tokenData.refresh_token;
		const expiresIn: number = tokenData.expires_in ?? 3600;

		// Parse JWT payload to extract user info (no verification needed - backend already verified)
		const claims = parseJwtPayload(accessToken);
		if (!claims) {
			return json(
				{ success: false, error: 'Failed to parse authentication token.' },
				{ status: 500 }
			);
		}

		const userId = String(
			claims.sub ?? claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? ''
		);
		const email = String(
			claims.email ?? claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? ''
		);
		const name = String(
			claims.name ??
			claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
			claims.given_name ??
			email
		);
		const roleClaim =
			claims.role ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
		const roles: string[] = Array.isArray(roleClaim)
			? roleClaim.map((r) => String(r))
			: [String(roleClaim)];

		setSession(cookies, {
			accessToken,
			refreshToken,
			userId,
			email,
			name,
			roles,
			tenantId: locals.tenant.id,
			expiresAt: Math.floor(Date.now() / 1000) + expiresIn
		});

		return json({ success: true, user: { id: userId, email, name, roles } });
	} catch (err) {
		console.error('Google sign-in error:', err);
		return json(
			{ success: false, error: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
}

/**
 * Decode JWT payload without verification.
 * Backend already verified the token - we just need claims.
 */
function parseJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		// Base64url decode the payload
		const payload = parts[1]
			.replace(/-/g, '+')
			.replace(/_/g, '/');
		const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
		const decoded = atob(padded);
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}
