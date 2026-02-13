import type { SessionData } from './auth.js';

/**
 * Decode JWT payload without verification.
 * Backend already verified the token - we just need claims.
 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
		const decoded = atob(padded);
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

/**
 * Extract session data from a token response and tenant ID.
 */
export function extractSessionFromToken(
	tokenData: { access_token: string; refresh_token?: string; expires_in?: number },
	tenantId: string
): SessionData | null {
	const accessToken = tokenData.access_token;
	const refreshToken = tokenData.refresh_token;
	const expiresIn = tokenData.expires_in ?? 3600;

	const claims = parseJwtPayload(accessToken);
	if (!claims) return null;

	const userId = String(
		claims.sub ?? claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? ''
	);
	const email = String(
		claims.email ??
			claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
			''
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
	const picture = claims.picture ? String(claims.picture) : undefined;

	// Detect phone auth: email like "66933786822@phone.budy.app" → extract phone number
	const phoneMatch = email.match(/^(\d+)@phone\.budy\.app$/);
	const phoneNumber = phoneMatch ? `+${phoneMatch[1]}` : undefined;

	return {
		accessToken,
		refreshToken,
		userId,
		email,
		name,
		picture,
		phoneNumber,
		roles,
		tenantId,
		expiresAt: Math.floor(Date.now() / 1000) + expiresIn
	};
}
