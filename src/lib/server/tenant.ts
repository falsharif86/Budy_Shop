import { env } from '$env/dynamic/private';

const RESERVED_SUBDOMAINS = new Set([
	'api',
	'admin',
	'objectbox',
	'portainer',
	'n8n',
	'www',
	'shop',
	'mail',
	'ftp',
	'sync'
]);

export interface TenantInfo {
	id: string;
	name: string;
	normalizedName: string;
}

/**
 * Extract subdomain from Host header.
 * Expected: `weed365.budy.app` -> `weed365`
 * Dev: `localhost:5173` -> null (use fallback)
 */
export function extractSubdomain(host: string): string | null {
	// Remove port
	const hostname = host.split(':')[0];

	// Local dev - no subdomain
	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		return null;
	}

	// Check for subdomain pattern: *.budy.app
	const parts = hostname.split('.');
	if (parts.length >= 3 && parts.slice(-2).join('.') === 'budy.app') {
		const subdomain = parts.slice(0, -2).join('.');
		if (RESERVED_SUBDOMAINS.has(subdomain)) return null;
		return subdomain;
	}

	return null;
}

/**
 * Look up tenant by name using the Budy tenant-lookup endpoint.
 */
export async function resolveTenant(subdomain: string): Promise<TenantInfo | null> {
	const apiBase = env.VITE_API_BASE_URL ?? 'https://api.budy.app';

	try {
		const res = await fetch(
			`${apiBase}/api/auth/tenant-lookup/by-name/${encodeURIComponent(subdomain)}`
		);
		if (!res.ok) return null;

		const data = await res.json();
		if (!data.success) return null;

		return {
			id: data.tenantId,
			name: data.name,
			normalizedName: subdomain.toUpperCase()
		};
	} catch {
		return null;
	}
}
