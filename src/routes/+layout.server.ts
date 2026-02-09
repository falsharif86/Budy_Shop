import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		tenant: locals.tenant
			? { id: locals.tenant.id, name: locals.tenant.name }
			: null
	};
};
