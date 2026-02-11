import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		tenant: locals.tenant
			? { id: locals.tenant.id, name: locals.tenant.name }
			: null,
		user: locals.user
			? {
					id: locals.user.id,
					email: locals.user.email,
					name: locals.user.name,
					roles: locals.user.roles
				}
			: null
	};
};
