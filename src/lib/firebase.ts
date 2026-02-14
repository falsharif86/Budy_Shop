import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
	apiKey: 'AIzaSyAuXxMSXmSM2hLU9J0SLpYmsOLjRXEYcAg',
	authDomain: 'budy-pos.firebaseapp.com',
	projectId: 'budy-pos',
	storageBucket: 'budy-pos.firebasestorage.app',
	messagingSenderId: '876147880116',
	appId: '1:876147880116:web:b5955e1f25c27589a467e1'
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function initFirebase(): Messaging | null {
	if (typeof window === 'undefined') return null;
	if (!('Notification' in window)) return null;

	if (messaging) return messaging;

	try {
		app = initializeApp(firebaseConfig);
		messaging = getMessaging(app);
		return messaging;
	} catch (e) {
		console.warn('[firebase] init failed:', e);
		return null;
	}
}

export async function requestNotificationPermission(
	msg: Messaging,
	vapidKey: string,
	serviceWorkerRegistration: ServiceWorkerRegistration
): Promise<string | null> {
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') return null;

	try {
		return await getToken(msg, { vapidKey, serviceWorkerRegistration });
	} catch (e) {
		console.warn('[firebase] failed to get FCM token:', e);
		return null;
	}
}

export { onMessage };
export type { Messaging };
