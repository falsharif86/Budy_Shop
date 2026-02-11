import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(303, '/');
	}

	return {
		googleClientId: env.GOOGLE_SHOP_CLIENT_ID ?? ''
	};
};
