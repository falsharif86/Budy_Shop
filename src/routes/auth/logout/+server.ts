import { redirect, type RequestEvent } from '@sveltejs/kit';
import { clearSession } from '$lib/server/auth.js';

export async function POST({ cookies }: RequestEvent) {
	clearSession(cookies);
	throw redirect(303, '/');
}
