import type { Cookies } from '@sveltejs/kit';

export interface SessionData {
	accessToken: string;
	refreshToken?: string;
	userId: string;
	email: string;
	name: string;
	picture?: string;
	roles: string[];
	tenantId: string;
	expiresAt: number; // Unix timestamp
}

const COOKIE_NAME = 'budy_shop_session';

export function setSession(cookies: Cookies, data: SessionData): void {
	const encoded = btoa(JSON.stringify(data));
	cookies.set(COOKIE_NAME, encoded, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7 // 7 days
	});
}

export function getSession(cookies: Cookies): SessionData | null {
	const cookie = cookies.get(COOKIE_NAME);
	if (!cookie) return null;

	try {
		const data = JSON.parse(atob(cookie)) as SessionData;
		// Check if expired
		if (data.expiresAt && Date.now() / 1000 > data.expiresAt) {
			clearSession(cookies);
			return null;
		}
		return data;
	} catch {
		return null;
	}
}

export function clearSession(cookies: Cookies): void {
	cookies.delete(COOKIE_NAME, { path: '/' });
}
