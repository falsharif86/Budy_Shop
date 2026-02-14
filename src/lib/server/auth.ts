import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { seal, unseal } from './crypto.js';

export interface SessionData {
	accessToken: string;
	refreshToken?: string;
	userId: string;
	email: string;
	name: string;
	picture?: string;
	phoneNumber?: string;
	roles: string[];
	tenantId: string;
	expiresAt: number; // Unix timestamp
}

/** Payload stored in the encrypted cookie (profile + refresh token, no access token). */
interface CookiePayload {
	userId: string;
	email: string;
	name: string;
	picture?: string;
	phoneNumber?: string;
	roles: string[];
	tenantId: string;
	refreshToken: string;
}

const COOKIE_NAME = 'budy_shop_session';

// In-memory access token cache — recoverable via refresh token after restart
const tokenCache = new Map<string, { accessToken: string; expiresAt: number }>();

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'lax' as const,
	maxAge: 60 * 60 * 24 * 30 // 30 days (matches refresh token lifetime)
};

let devFallbackWarned = false;

function getSessionSecret(): string {
	const secret = env.SESSION_SECRET;
	if (secret) return secret;

	if (!devFallbackWarned) {
		console.warn('SESSION_SECRET not set — using dev fallback. Set this in production!');
		devFallbackWarned = true;
	}
	return 'budy-dev-session-secret-not-for-production-use!!';
}

export function setSession(cookies: Cookies, data: SessionData): void {
	const secret = getSessionSecret();

	const payload: CookiePayload = {
		userId: data.userId,
		email: data.email,
		name: data.name,
		picture: data.picture,
		phoneNumber: data.phoneNumber,
		roles: data.roles,
		tenantId: data.tenantId,
		refreshToken: data.refreshToken ?? ''
	};

	cookies.set(COOKIE_NAME, seal(payload, secret), COOKIE_OPTIONS);

	// Cache the access token in memory
	tokenCache.set(data.userId, {
		accessToken: data.accessToken,
		expiresAt: data.expiresAt
	});
}

export function getSession(cookies: Cookies): SessionData | null {
	const sealed = cookies.get(COOKIE_NAME);
	if (!sealed) return null;

	const secret = getSessionSecret();
	const payload = unseal<CookiePayload>(sealed, secret);
	if (!payload) return null;

	// Look up cached access token
	const cached = tokenCache.get(payload.userId);
	const now = Math.floor(Date.now() / 1000);

	return {
		...payload,
		accessToken: cached && cached.expiresAt > now ? cached.accessToken : '',
		expiresAt: cached?.expiresAt ?? 0
	};
}

export function clearSession(cookies: Cookies): void {
	const sealed = cookies.get(COOKIE_NAME);
	if (sealed) {
		const secret = getSessionSecret();
		const payload = unseal<CookiePayload>(sealed, secret);
		if (payload) tokenCache.delete(payload.userId);
	}
	cookies.delete(COOKIE_NAME, { path: '/' });
}

export function updateSession(
	cookies: Cookies,
	updates: Partial<Pick<SessionData, 'name' | 'picture' | 'email'>>
): boolean {
	const sealed = cookies.get(COOKIE_NAME);
	if (!sealed) return false;

	const secret = getSessionSecret();
	const payload = unseal<CookiePayload>(sealed, secret);
	if (!payload) return false;

	if (updates.name !== undefined) payload.name = updates.name;
	if (updates.picture !== undefined) payload.picture = updates.picture;
	if (updates.email !== undefined) payload.email = updates.email;

	cookies.set(COOKIE_NAME, seal(payload, secret), COOKIE_OPTIONS);
	return true;
}

/** Cache a new access token after a successful refresh. */
export function cacheAccessToken(userId: string, accessToken: string, expiresAt: number): void {
	tokenCache.set(userId, { accessToken, expiresAt });
}

/** Re-seal the cookie with a rotated refresh token. */
export function updateRefreshToken(
	cookies: Cookies,
	userId: string,
	refreshToken: string
): void {
	const sealed = cookies.get(COOKIE_NAME);
	if (!sealed) return;

	const secret = getSessionSecret();
	const payload = unseal<CookiePayload>(sealed, secret);
	if (!payload || payload.userId !== userId) return;

	payload.refreshToken = refreshToken;
	cookies.set(COOKIE_NAME, seal(payload, secret), COOKIE_OPTIONS);
}
