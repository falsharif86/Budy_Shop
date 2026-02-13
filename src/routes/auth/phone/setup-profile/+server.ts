import { json, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { updateSession } from '$lib/server/auth.js';

export async function POST({ request, locals, cookies }: RequestEvent) {
	if (!locals.user) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	let body: { name?: string; avatarPath?: string };
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid request body' }, { status: 400 });
	}

	const { name, avatarPath } = body;
	if (!name || name.trim().length === 0) {
		return json({ success: false, error: 'Name is required' }, { status: 400 });
	}

	if (name.trim().length > 100) {
		return json({ success: false, error: 'Name is too long' }, { status: 400 });
	}

	const apiBaseUrl = env.VITE_API_BASE_URL ?? 'https://api.budy.app';

	try {
		const res = await fetch(`${apiBaseUrl}/api/auth/phone/setup-profile`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${locals.user.accessToken}`
			},
			body: JSON.stringify({
				name: name.trim(),
				avatarPath: avatarPath ?? null
			})
		});

		const result = await res.json();

		if (!result.success) {
			return json(
				{ success: false, error: result.error ?? 'Failed to update profile' },
				{ status: 400 }
			);
		}

		// Update session in memory
		updateSession(cookies, {
			name: name.trim(),
			picture: avatarPath ?? undefined
		});

		return json({ success: true });
	} catch (err) {
		console.error('Setup profile error:', err);
		return json(
			{ success: false, error: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
}
