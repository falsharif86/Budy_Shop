import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ locals }) => {
	const tenant = locals.tenant;
	const tenantName = tenant?.name ?? 'Budy Shop';
	const shortName = tenantName.length > 12 ? tenantName.slice(0, 12).trim() : tenantName;

	const manifest = {
		name: tenant ? `${tenantName} | Budy` : 'Budy Shop',
		short_name: shortName,
		description: `${tenantName} - Browse products and order online`,
		start_url: '/',
		display: 'standalone' as const,
		theme_color: '#121a17',
		background_color: '#121a17',
		icons: [
			{ src: '/icon-48.png', sizes: '48x48', type: 'image/png' },
			{ src: '/icon-128.png', sizes: '128x128', type: 'image/png' },
			{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
			{ src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
		]
	};

	return new Response(JSON.stringify(manifest), {
		headers: {
			'Content-Type': 'application/manifest+json',
			'Cache-Control': 'public, max-age=600'
		}
	});
};
