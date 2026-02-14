import type { Handle } from '@sveltejs/kit';
import { extractSubdomain, resolveTenant } from '$lib/server/tenant.js';
import {
	getSession,
	clearSession,
	cacheAccessToken,
	updateRefreshToken
} from '$lib/server/auth.js';
import { refreshAccessToken } from '$lib/server/token-refresh.js';
import { env } from '$env/dynamic/private';

const EXPIRY_BUFFER_SECONDS = 60;

export const handle: Handle = async ({ event, resolve }) => {
	const host = event.request.headers.get('host') ?? '';
	const subdomain = extractSubdomain(host);

	if (subdomain) {
		const tenant = await resolveTenant(subdomain);
		event.locals.tenant = tenant;
	} else {
		// Dev mode: use fallback tenant from env
		const fallbackTenantId = env.DEV_TENANT_ID;
		const fallbackTenantName = env.DEV_TENANT_NAME;
		if (fallbackTenantId && fallbackTenantName) {
			event.locals.tenant = {
				id: fallbackTenantId,
				name: fallbackTenantName,
				normalizedName: fallbackTenantName.toUpperCase()
			};
		} else {
			event.locals.tenant = null;
		}
	}

	// Load user session from encrypted cookie
	const session = getSession(event.cookies);
	if (!session) {
		event.locals.user = null;
		return resolve(event);
	}

	let accessToken = session.accessToken;

	// Auto-refresh if token is missing (cache miss after restart) or about to expire
	if (
		!accessToken ||
		session.expiresAt - Math.floor(Date.now() / 1000) < EXPIRY_BUFFER_SECONDS
	) {
		if (session.refreshToken) {
			const refreshed = await refreshAccessToken(session.refreshToken, session.tenantId);
			if (refreshed) {
				accessToken = refreshed.accessToken;
				cacheAccessToken(session.userId, refreshed.accessToken, refreshed.expiresAt);

				// Re-seal cookie if refresh token was rotated
				if (refreshed.refreshToken !== session.refreshToken) {
					updateRefreshToken(event.cookies, session.userId, refreshed.refreshToken);
				}
			} else {
				// Refresh failed — session is dead
				clearSession(event.cookies);
				event.locals.user = null;
				return resolve(event);
			}
		} else {
			// No refresh token — can't recover
			clearSession(event.cookies);
			event.locals.user = null;
			return resolve(event);
		}
	}

	event.locals.user = {
		id: session.userId,
		email: session.email,
		name: session.name,
		picture: session.picture,
		phoneNumber: session.phoneNumber,
		accessToken,
		roles: session.roles
	};

	return resolve(event);
};
