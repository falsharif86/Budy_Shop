let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
let dismissed = $state(false);
let installed = $state(false);

function createPwaStore() {
	return {
		get canInstall() {
			return deferredPrompt !== null && !dismissed && !installed;
		},
		get isInstalled() {
			return installed;
		},

		capturePrompt(e: BeforeInstallPromptEvent) {
			e.preventDefault();
			deferredPrompt = e;
		},

		markInstalled() {
			installed = true;
			deferredPrompt = null;
		},

		async install() {
			if (!deferredPrompt) return;
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === 'accepted') {
				installed = true;
			}
			deferredPrompt = null;
		},

		dismiss() {
			dismissed = true;
			deferredPrompt = null;
		}
	};
}

export const pwa = createPwaStore();
