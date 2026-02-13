// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	interface BeforeInstallPromptEvent extends Event {
		readonly platforms: string[];
		readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
		prompt(): Promise<void>;
	}

	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent;
	}

	namespace App {
		interface Locals {
			tenant: {
				id: string;
				name: string;
				normalizedName: string;
			} | null;
			user: {
				id: string;
				email: string;
				name: string;
				picture?: string;
				phoneNumber?: string;
				accessToken: string;
				roles: string[];
			} | null;
		}
		interface PageData {
			tenant: {
				id: string;
				name: string;
			} | null;
			user: {
				id: string;
				email: string;
				name: string;
				picture?: string;
				phoneNumber?: string;
				roles: string[];
			} | null;
		}
	}

	// Google Identity Services types
	namespace google.accounts.id {
		interface CredentialResponse {
			credential: string;
			select_by: string;
			clientId?: string;
		}

		interface IdConfiguration {
			client_id: string;
			callback: (response: CredentialResponse) => void;
			auto_select?: boolean;
			cancel_on_tap_outside?: boolean;
			context?: string;
		}

		interface ButtonConfig {
			type?: 'standard' | 'icon';
			theme?: 'outline' | 'filled_blue' | 'filled_black';
			size?: 'large' | 'medium' | 'small';
			text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
			shape?: 'rectangular' | 'pill' | 'circle' | 'square';
			logo_alignment?: 'left' | 'center';
			width?: number;
			locale?: string;
		}

		function initialize(config: IdConfiguration): void;
		function renderButton(parent: HTMLElement, config: ButtonConfig): void;
		function prompt(): void;
		function disableAutoSelect(): void;
	}
}

export {};
