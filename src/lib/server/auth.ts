import type { Cookies } from '@sveltejs/kit';


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

const COOKIE_NAME = 'budy_shop_session';

// Server-side session store (cookie holds only a UUID session ID)
const sessions = new Map<string, SessionData>();

export function setSession(cookies: Cookies, data: SessionData): void {
	// Clear any previous session for this cookie
	const oldId = cookies.get(COOKIE_NAME);
	if (oldId) sessions.delete(oldId);

	const sessionId = crypto.randomUUID();
	sessions.set(sessionId, data);
	cookies.set(COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7 // 7 days
	});
}

export function getSession(cookies: Cookies): SessionData | null {
	const sessionId = cookies.get(COOKIE_NAME);
	if (!sessionId) return null;

	const data = sessions.get(sessionId);
	if (!data) return null;

	if (data.expiresAt && Date.now() / 1000 > data.expiresAt) {
		clearSession(cookies);
		return null;
	}
	return data;
}

export function clearSession(cookies: Cookies): void {
	const sessionId = cookies.get(COOKIE_NAME);
	if (sessionId) sessions.delete(sessionId);
	cookies.delete(COOKIE_NAME, { path: '/' });
}

export function updateSession(
	cookies: Cookies,
	updates: Partial<Pick<SessionData, 'name' | 'picture' | 'email'>>
): boolean {
	const sessionId = cookies.get(COOKIE_NAME);
	if (!sessionId) return false;

	const data = sessions.get(sessionId);
	if (!data) return false;

	if (updates.name !== undefined) data.name = updates.name;
	if (updates.picture !== undefined) data.picture = updates.picture;
	if (updates.email !== undefined) data.email = updates.email;

	return true;
}
