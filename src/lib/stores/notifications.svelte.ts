let permission = $state<NotificationPermission>('default');
let fcmToken = $state<string | null>(null);
let supported = $state(false);
let initialized = $state(false);
let dismissed = $state(false);
let subscribing = $state(false);

const DISMISSED_KEY = 'budy_notif_dismissed';
const TOKEN_KEY = 'budy_notif_token';

/** VAPID key for FCM web push - configure in Firebase Console */
const VAPID_KEY = 'PLACEHOLDER_VAPID_KEY'; // replace after Firebase Console setup

function createNotificationStore() {
	return {
		get permission() {
			return permission;
		},
		get fcmToken() {
			return fcmToken;
		},
		get isSupported() {
			return supported;
		},
		get isInitialized() {
			return initialized;
		},
		get isSubscribed() {
			return fcmToken !== null;
		},
		get isSubscribing() {
			return subscribing;
		},
		get canPrompt() {
			return supported && permission === 'default' && !dismissed && !fcmToken;
		},
		get isDenied() {
			return permission === 'denied';
		},

		init() {
			if (typeof window === 'undefined') return;
			if (initialized) return;

			supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
			if (!supported) return;

			permission = Notification.permission;

			// Restore dismissed state and saved token
			try {
				dismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
				const savedToken = localStorage.getItem(TOKEN_KEY);
				if (savedToken && permission === 'granted') {
					fcmToken = savedToken;
				}
			} catch {
				// Storage unavailable
			}

			initialized = true;
		},

		async subscribe(memberId?: string) {
			if (!supported || subscribing) return;
			subscribing = true;

			try {
				const { initFirebase, requestNotificationPermission } = await import('$lib/firebase.js');
				const messaging = initFirebase();
				if (!messaging) {
					subscribing = false;
					return;
				}

				const registration = await navigator.serviceWorker.ready;
				const token = await requestNotificationPermission(messaging, VAPID_KEY, registration);

				if (!token) {
					permission = Notification.permission;
					subscribing = false;
					return;
				}

				// Register token with backend via SvelteKit API route
				// The server route handles auth headers (Authorization + X-Tenant-Id) automatically
				const response = await fetch('/api/notifications/subscribe', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token, memberId })
				});

				if (response.ok) {
					fcmToken = token;
					permission = 'granted';
					try {
						localStorage.setItem(TOKEN_KEY, token);
						localStorage.removeItem(DISMISSED_KEY);
					} catch {
						// Storage unavailable
					}
				} else {
					console.warn('[notifications] backend registration failed:', response.status);
				}
			} catch (e) {
				console.warn('[notifications] subscribe failed:', e);
			} finally {
				subscribing = false;
			}
		},

		async unsubscribe() {
			if (!fcmToken) return;

			const tokenToRemove = fcmToken;

			try {
				await fetch('/api/notifications/subscribe', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token: tokenToRemove })
				});
			} catch (e) {
				console.warn('[notifications] unsubscribe failed:', e);
			}

			fcmToken = null;
			try {
				localStorage.removeItem(TOKEN_KEY);
			} catch {
				// Storage unavailable
			}
		},

		dismiss() {
			dismissed = true;
			try {
				localStorage.setItem(DISMISSED_KEY, 'true');
			} catch {
				// Storage unavailable
			}
		},

		/** Listen for foreground messages and show in-app notification */
		async listenForeground(onMessage: (payload: FcmPayload) => void) {
			try {
				const firebase = await import('$lib/firebase.js');
				const messaging = firebase.initFirebase();
				if (!messaging) return;

				firebase.onMessage(messaging, (payload) => {
					onMessage(payload as unknown as FcmPayload);
				});
			} catch (e) {
				console.warn('[notifications] foreground listener failed:', e);
			}
		}
	};
}

export interface FcmPayload {
	notification?: {
		title?: string;
		body?: string;
	};
	data?: {
		type?: string;
		orderId?: string;
		orderNo?: string;
		status?: string;
		statusName?: string;
		tenantId?: string;
		[key: string]: string | undefined;
	};
}

export const notifications = createNotificationStore();
