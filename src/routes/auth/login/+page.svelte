<script lang="ts">
	import { goto } from '$app/navigation';
	import budyLogo from '$lib/assets/budy_logo.svg';

	let { data } = $props();

	let loading = $state(false);
	let error = $state('');
	let googleButtonEl: HTMLDivElement | undefined = $state();

	const tenantName = $derived(data.tenant?.name ?? 'Shop');

	$effect(() => {
		if (data.googleClientId && googleButtonEl) {
			loadGoogleScript();
		}
	});

	function loadGoogleScript() {
		// Check if already loaded
		if (typeof google !== 'undefined' && google.accounts) {
			initializeGoogle();
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => initializeGoogle();
		script.onerror = () => {
			error = 'Failed to load Google Sign-In. Please try again.';
		};
		document.head.appendChild(script);
	}

	function initializeGoogle() {
		if (!googleButtonEl) return;

		google.accounts.id.initialize({
			client_id: data.googleClientId,
			callback: handleCredentialResponse,
			auto_select: false,
			cancel_on_tap_outside: true
		});

		google.accounts.id.renderButton(googleButtonEl, {
			theme: 'filled_black',
			size: 'large',
			shape: 'pill',
			width: 320,
			text: 'continue_with',
			logo_alignment: 'left'
		});
	}

	async function handleCredentialResponse(response: google.accounts.id.CredentialResponse) {
		loading = true;
		error = '';

		try {
			const res = await fetch('/auth/google', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken: response.credential })
			});

			const result = await res.json();

			if (result.success) {
				await goto('/', { replaceState: true, invalidateAll: true });
			} else {
				error = result.error ?? 'Sign in failed. Please try again.';
			}
		} catch {
			error = 'Network error. Please check your connection and try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign in | {tenantName} | Budy</title>
</svelte:head>

<div class="login-page">
	<div class="login-card">
		<!-- Logo & Branding -->
		<div class="login-header">
			<img src={budyLogo} alt="Budy" class="login-logo" />
			<h1 class="login-title">Welcome to {tenantName}</h1>
			<p class="login-subtitle">Sign in to your account to continue</p>
		</div>

		<!-- Google Sign-In Button -->
		<div class="login-actions">
			{#if loading}
				<div class="login-loading">
					<div class="spinner"></div>
					<span class="loading-text">Signing you in...</span>
				</div>
			{:else}
				<div bind:this={googleButtonEl} class="google-btn-container"></div>
			{/if}

			{#if error}
				<div class="login-error" role="alert">
					<svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<p class="login-footer">
			By continuing, you agree to the shop's terms and conditions.
		</p>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: 1.5rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		padding: 2.5rem 2rem;
		border-radius: var(--md-sys-shape-corner-xl);
		background: var(--md-sys-color-surface-container);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.login-header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.login-logo {
		width: 3.5rem;
		height: 3.5rem;
		margin-bottom: 0.5rem;
	}

	.login-title {
		font: var(--md-sys-typescale-headline-small);
		color: var(--md-sys-color-on-surface);
	}

	.login-subtitle {
		font: var(--md-sys-typescale-body-medium);
		color: var(--md-sys-color-outline);
	}

	.login-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
	}

	.google-btn-container {
		display: flex;
		justify-content: center;
		min-height: 44px;
	}

	.login-loading {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.5rem;
	}

	.spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid var(--md-sys-color-outline-variant);
		border-top-color: var(--md-sys-color-primary);
		border-radius: 50%;
		animation: spin 600ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		font: var(--md-sys-typescale-body-medium);
		color: var(--md-sys-color-on-surface-variant);
	}

	.login-error {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: var(--md-sys-shape-corner-medium);
		background: var(--md-sys-color-error-container);
		color: var(--md-sys-color-error);
		font: var(--md-sys-typescale-body-medium);
		width: 100%;
	}

	.error-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		margin-top: 0.0625rem;
	}

	.login-footer {
		font: var(--md-sys-typescale-label-medium);
		color: var(--md-sys-color-outline);
		text-align: center;
		max-width: 280px;
	}
</style>
