<script lang="ts">
	import { goto } from '$app/navigation';
	import budyLogo from '$lib/assets/budy_logo.svg';

	let { data } = $props();

	type AuthStep = 'phone-input' | 'pin-input';

	let authStep = $state<AuthStep>('phone-input');
	let loading = $state(false);
	let error = $state('');

	// Phone auth state
	let phoneNumber = $state('');
	let pin = $state(['', '', '', '']);
	let verificationId = $state('');
	let countdown = $state(0);
	let pinInputEls: HTMLInputElement[] = [];
	let countdownInterval: ReturnType<typeof setInterval> | undefined;

	const tenantName = $derived(data.tenant?.name ?? 'Shop');

	$effect(() => {
		return () => {
			if (countdownInterval) clearInterval(countdownInterval);
		};
	});

	function goBack() {
		if (authStep === 'pin-input') {
			authStep = 'phone-input';
		}
		error = '';
	}

	async function requestPin() {
		if (!phoneNumber.trim()) {
			error = 'Please enter your phone number.';
			return;
		}

		loading = true;
		error = '';

		try {
			const res = await fetch('/auth/phone/request-pin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phoneNumber: phoneNumber.trim() })
			});

			const result = await res.json();

			if (result.success) {
				verificationId = result.verificationId;
				authStep = 'pin-input';
				pin = ['', '', '', ''];
				startCountdown(result.expiresIn ?? 300);
				// Focus first PIN input after render
				setTimeout(() => pinInputEls[0]?.focus(), 50);
			} else {
				error = result.error ?? 'Failed to send verification code.';
			}
		} catch {
			error = 'Network error. Please check your connection and try again.';
		} finally {
			loading = false;
		}
	}

	function startCountdown(seconds: number) {
		if (countdownInterval) clearInterval(countdownInterval);
		countdown = seconds;
		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(countdownInterval);
				countdownInterval = undefined;
			}
		}, 1000);
	}

	function formatCountdown(secs: number): string {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function handlePinInput(index: number, event: Event) {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		// Only allow single digits
		if (value.length > 1) {
			input.value = value[value.length - 1];
		}

		pin[index] = input.value;

		// Auto-advance
		if (input.value && index < 3) {
			pinInputEls[index + 1]?.focus();
		}

		// Auto-submit when all filled
		if (pin.every((d) => d !== '')) {
			verifyPin();
		}
	}

	function handlePinKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Backspace' && !pin[index] && index > 0) {
			pinInputEls[index - 1]?.focus();
		}
	}

	function handlePinPaste(event: ClipboardEvent) {
		event.preventDefault();
		const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
		if (pasted.length === 0) return;

		const digits = pasted.slice(0, 4).split('');
		for (let i = 0; i < 4; i++) {
			pin[i] = digits[i] ?? '';
			if (pinInputEls[i]) pinInputEls[i].value = pin[i];
		}

		// Focus last filled or next empty
		const nextEmpty = pin.findIndex((d) => d === '');
		if (nextEmpty >= 0) {
			pinInputEls[nextEmpty]?.focus();
		} else {
			pinInputEls[3]?.focus();
			verifyPin();
		}
	}

	async function verifyPin() {
		const pinCode = pin.join('');
		if (pinCode.length !== 4) return;

		loading = true;
		error = '';

		try {
			const res = await fetch('/auth/phone/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ verificationId, pin: pinCode })
			});

			const result = await res.json();

			if (result.success) {
				await goto(result.redirectTo ?? '/', { replaceState: true, invalidateAll: true });
			} else {
				error = result.error ?? 'Verification failed. Please try again.';
				pin = ['', '', '', ''];
				pinInputEls.forEach((el) => {
					if (el) el.value = '';
				});
				pinInputEls[0]?.focus();
			}
		} catch {
			error = 'Network error. Please check your connection and try again.';
		} finally {
			loading = false;
		}
	}

	async function resendPin() {
		if (countdown > 0) return;
		await requestPin();
	}
</script>

<svelte:head>
	<title>Sign in | {tenantName} | Budy</title>
</svelte:head>

<div class="login-page">
	<div class="login-card">
		<!-- Logo & Branding -->
		<div class="login-header">
			{#if authStep === 'pin-input'}
				<button class="back-btn" onclick={goBack} aria-label="Go back">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
			{/if}
			<img src={budyLogo} alt="Budy" class="login-logo" />
			<h1 class="login-title">Welcome to {tenantName}</h1>
			<p class="login-subtitle">
				{#if authStep === 'phone-input'}
					Sign in with your phone number
				{:else}
					Enter the verification code
				{/if}
			</p>
		</div>

		<!-- Phone input -->
		{#if authStep === 'phone-input'}
			<div class="login-actions">
				<div class="phone-input-group">
					<input
						type="tel"
						class="phone-input"
						placeholder="+31 6 12345678"
						bind:value={phoneNumber}
						onkeydown={(e) => e.key === 'Enter' && requestPin()}
						disabled={loading}
					/>
				</div>

				<button class="send-code-btn" onclick={requestPin} disabled={loading || !phoneNumber.trim()}>
					{#if loading}
						<div class="spinner spinner-small"></div>
						Sending...
					{:else}
						Send Code
					{/if}
				</button>
			</div>

		<!-- Step 3: PIN input -->
		{:else if authStep === 'pin-input'}
			<div class="login-actions">
				<p class="pin-hint">Code sent to <strong>{phoneNumber}</strong></p>

				<div class="pin-inputs" onpaste={handlePinPaste}>
					{#each [0, 1, 2, 3] as i}
						<input
							type="text"
							inputmode="numeric"
							maxlength="1"
							class="pin-digit"
							value={pin[i]}
							bind:this={pinInputEls[i]}
							oninput={(e) => handlePinInput(i, e)}
							onkeydown={(e) => handlePinKeydown(i, e)}
							disabled={loading}
						/>
					{/each}
				</div>

				{#if loading}
					<div class="login-loading">
						<div class="spinner"></div>
						<span class="loading-text">Verifying...</span>
					</div>
				{/if}

				<div class="resend-row">
					{#if countdown > 0}
						<span class="countdown-text">Resend in {formatCountdown(countdown)}</span>
					{:else}
						<button class="resend-btn" onclick={resendPin}>Resend code</button>
					{/if}
				</div>
			</div>
		{/if}

		{#if error}
			<div class="login-error" role="alert">
				<svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
				</svg>
				<span>{error}</span>
			</div>
		{/if}

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
		position: relative;
	}

	.login-header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.back-btn {
		position: absolute;
		top: 1.25rem;
		left: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		border-radius: var(--md-sys-shape-corner-full, 50%);
		background: transparent;
		color: var(--md-sys-color-on-surface);
		cursor: pointer;
		transition: background 200ms;
	}

	.back-btn:hover {
		background: var(--md-sys-color-surface-container-highest);
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

	.phone-input-group {
		width: 100%;
	}

	.phone-input {
		width: 100%;
		height: 3rem;
		padding: 0 1rem;
		border: 1px solid var(--md-sys-color-outline);
		border-radius: var(--md-sys-shape-corner-medium);
		background: var(--md-sys-color-surface);
		color: var(--md-sys-color-on-surface);
		font: var(--md-sys-typescale-body-large);
		outline: none;
		transition: border-color 200ms;
		box-sizing: border-box;
	}

	.phone-input:focus {
		border-color: var(--md-sys-color-primary);
		border-width: 2px;
		padding: 0 calc(1rem - 1px);
	}

	.phone-input:disabled {
		opacity: 0.6;
	}

	.send-code-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		height: 3rem;
		border: none;
		border-radius: var(--md-sys-shape-corner-full, 24px);
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		font: var(--md-sys-typescale-label-large);
		cursor: pointer;
		transition: opacity 200ms;
	}

	.send-code-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.send-code-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pin-hint {
		font: var(--md-sys-typescale-body-medium);
		color: var(--md-sys-color-outline);
		text-align: center;
	}

	.pin-hint strong {
		color: var(--md-sys-color-on-surface);
	}

	.pin-inputs {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.pin-digit {
		width: 3.5rem;
		height: 3.5rem;
		text-align: center;
		font: var(--md-sys-typescale-headline-medium);
		color: var(--md-sys-color-on-surface);
		border: 1px solid var(--md-sys-color-outline);
		border-radius: var(--md-sys-shape-corner-medium);
		background: var(--md-sys-color-surface);
		outline: none;
		transition: border-color 200ms;
		caret-color: var(--md-sys-color-primary);
	}

	.pin-digit:focus {
		border-color: var(--md-sys-color-primary);
		border-width: 2px;
	}

	.pin-digit:disabled {
		opacity: 0.6;
	}

	.resend-row {
		text-align: center;
	}

	.countdown-text {
		font: var(--md-sys-typescale-body-medium);
		color: var(--md-sys-color-outline);
	}

	.resend-btn {
		background: none;
		border: none;
		color: var(--md-sys-color-primary);
		font: var(--md-sys-typescale-label-large);
		cursor: pointer;
		padding: 0.5rem 1rem;
		border-radius: var(--md-sys-shape-corner-medium);
		transition: background 200ms;
	}

	.resend-btn:hover {
		background: var(--md-sys-color-primary-container);
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

	.spinner-small {
		width: 1rem;
		height: 1rem;
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
