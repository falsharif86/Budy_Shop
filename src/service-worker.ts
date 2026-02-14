/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const SHELL_CACHE = `budy-shell-${version}`;
const FONTS_CACHE = 'budy-fonts-v1';
const IMAGES_CACHE = 'budy-images-v1';
const IMAGES_MAX = 100;

const SHELL_ASSETS = [...build, ...files];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#121a17"/>
<title>Offline | Budy</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#121a17;color:#e0e3e1;font-family:Inter,system-ui,sans-serif;
display:flex;align-items:center;justify-content:center;min-height:100dvh;padding:2rem}
.card{text-align:center;max-width:360px}
.icon{width:64px;height:64px;margin:0 auto 1.5rem;opacity:.6}
h1{font-size:1.5rem;font-weight:600;margin-bottom:.75rem}
p{font-size:.875rem;color:#a0a4a2;line-height:1.5;margin-bottom:1.5rem}
button{background:#2d8b5e;color:#fff;border:none;border-radius:12px;
padding:.75rem 2rem;font-size:.875rem;font-weight:500;cursor:pointer;
transition:background .2s}
button:hover{background:#3aa672}
</style>
</head>
<body>
<div class="card">
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
<path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z"/>
<path d="M12 15.75h.007v.008H12v-.008Z"/>
</svg>
<h1>You're Offline</h1>
<p>It looks like you've lost your internet connection. Check your connection and try again.</p>
<button onclick="location.reload()">Retry</button>
</div>
</body>
</html>`;

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
	);
	sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key) => {
					if (key.startsWith('budy-shell-') && key !== SHELL_CACHE) {
						return caches.delete(key);
					}
				})
			)
		)
	);
	sw.clients.claim();
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Never cache API, auth, or manifest requests
	if (
		url.pathname.startsWith('/api/') ||
		url.pathname.startsWith('/auth/') ||
		url.pathname === '/manifest.webmanifest'
	) {
		return;
	}

	// Shell assets (build + static files) — cache-first
	if (SHELL_ASSETS.includes(url.pathname)) {
		event.respondWith(
			caches.match(request).then((cached) => cached ?? fetch(request))
		);
		return;
	}

	// Google Fonts — cache-first
	if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) return cached;
				return fetch(request).then((response) => {
					const clone = response.clone();
					caches.open(FONTS_CACHE).then((cache) => cache.put(request, clone));
					return response;
				});
			})
		);
		return;
	}

	// External product images — stale-while-revalidate with size cap
	if (
		request.destination === 'image' &&
		url.origin !== self.location.origin
	) {
		event.respondWith(
			caches.open(IMAGES_CACHE).then(async (cache) => {
				const cached = await cache.match(request);
				const networkFetch = fetch(request)
					.then(async (response) => {
						const keys = await cache.keys();
						if (keys.length >= IMAGES_MAX) {
							await cache.delete(keys[0]);
						}
						cache.put(request, response.clone());
						return response;
					})
					.catch(() => cached as Response);

				return cached ?? networkFetch;
			})
		);
		return;
	}

	// HTML navigation — network-first with offline fallback
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request).catch(() => new Response(OFFLINE_HTML, {
				headers: { 'Content-Type': 'text/html; charset=utf-8' }
			}))
		);
		return;
	}
});

// ─── Push Notifications ─────────────────────────────────────────────

sw.addEventListener('push', (event) => {
	if (!event.data) return;

	try {
		const payload = event.data.json();
		const notification = payload.notification || {};
		const data = payload.data || {};

		const title = notification.title || data.title || 'Budy';
		const body = notification.body || data.body || '';

		event.waitUntil(
			sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
				const focusedClient = clients.find((c) => c.visibilityState === 'visible');

				if (focusedClient) {
					// App is in foreground — post message to client for in-app handling
					// (update stores, show toast). Also show a subtle notification.
					focusedClient.postMessage({
						type: 'PUSH_RECEIVED',
						payload: { notification: { title, body }, data }
					});
				}

				// Always show system notification (foreground: tag deduplicates, background: primary UX)
				return sw.registration.showNotification(title, {
					body,
					icon: '/icon-192.png',
					badge: '/icon-48.png',
					tag: data.orderId || 'budy-notification',
					data: data
				});
			})
		);
	} catch (e) {
		console.error('[sw] push handler error:', e);
	}
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const data = event.notification.data || {};
	const orderId = data.orderId;
	const url = orderId ? `/?openOrder=${orderId}` : `/?openOrders=true`;

	event.waitUntil(
		sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
			for (const client of clients) {
				if (client.url.includes(sw.location.origin) && 'focus' in client) {
					client.navigate(url);
					return client.focus();
				}
			}
			return sw.clients.openWindow(url);
		})
	);
});
