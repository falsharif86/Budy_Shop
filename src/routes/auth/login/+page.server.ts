import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}
	// Login is now a bottom sheet overlay — redirect to home with param
	throw redirect(303, '/?login');
};
