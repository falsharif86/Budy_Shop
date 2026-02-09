import { getHostDb } from './db.js';

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
 * Look up tenant by normalized name in budy_host.Tenants collection.
 */
export async function resolveTenant(subdomain: string): Promise<TenantInfo | null> {
	const db = await getHostDb();
	const collection = db.collection('Tenants');
	const tenant = await collection.findOne({
		NormalizedName: subdomain.toUpperCase(),
		IsDeleted: { $ne: true },
		IsEnabled: true
	});

	if (!tenant) return null;

	return {
		id: tenant._id.toString(),
		name: tenant.Name as string,
		normalizedName: tenant.NormalizedName as string
	};
}
