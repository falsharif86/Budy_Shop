import { env } from '$env/dynamic/private';

export interface RefreshResult {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
}

// Deduplication: concurrent refresh requests for the same token share one in-flight Promise
const inflightRefreshes = new Map<string, Promise<RefreshResult | null>>();

export async function refreshAccessToken(
	refreshToken: string,
	tenantId: string
): Promise<RefreshResult | null> {
	const key = refreshToken.slice(0, 32);

	const inflight = inflightRefreshes.get(key);
	if (inflight) return inflight;

	const promise = doRefresh(refreshToken).finally(() => {
		inflightRefreshes.delete(key);
	});

	inflightRefreshes.set(key, promise);
	return promise;
}

async function doRefresh(refreshToken: string): Promise<RefreshResult | null> {
	const apiBaseUrl = env.VITE_API_BASE_URL ?? 'https://api.budy.app';

	try {
		const res = await fetch(`${apiBaseUrl}/connect/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
				client_id: 'Budy_Shop',
				scope: 'offline_access Budy'
			}).toString()
		});

		if (!res.ok) {
			console.warn(`Token refresh failed: ${res.status}`);
			return null;
		}

		const data = await res.json();
		const expiresIn = data.expires_in ?? 3600;

		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token ?? refreshToken,
			expiresAt: Math.floor(Date.now() / 1000) + expiresIn
		};
	} catch (err) {
		console.error('Token refresh error:', err);
		return null;
	}
}
