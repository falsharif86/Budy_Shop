import type { Handle } from '@sveltejs/kit';
import { extractSubdomain, resolveTenant } from '$lib/server/tenant.js';
import { env } from '$env/dynamic/private';

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

	return resolve(event);
};
