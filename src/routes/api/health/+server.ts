import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { version } from '$app/environment';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		version: version || env.BUILD_VERSION || '0.1.0-dev',
		commit: env.GIT_COMMIT || 'unknown',
		branch: env.GIT_BRANCH || 'unknown',
		buildTime: env.BUILD_TIME || 'unknown'
	});
};
