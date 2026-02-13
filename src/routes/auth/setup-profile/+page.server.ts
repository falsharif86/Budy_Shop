import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/?login');
	}

	// If name doesn't match phone pattern, profile is already set up
	const isPhoneName = /^\+?\d{8,15}$/.test(locals.user.name);
	if (!isPhoneName) {
		throw redirect(303, '/');
	}

	return {
		tenant: locals.tenant ? { id: locals.tenant.id, name: locals.tenant.name } : null
	};
};
