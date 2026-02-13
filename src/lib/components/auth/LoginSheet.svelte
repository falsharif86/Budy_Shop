<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import budyLogo from '$lib/assets/budy_logo.svg';
	import { IconCheck } from '$lib/components/icons/index.js';
	import CountryCodeSelector from '$lib/components/shared/CountryCodeSelector.svelte';
	import { COUNTRIES, DEFAULT_COUNTRY, type Country } from '$lib/data/countries.js';
	import Numpad from '$lib/components/shared/Numpad.svelte';
	import { ui } from '$lib/stores/ui.svelte.js';

	interface Props {
		tenantName: string;
	}

	let { tenantName }: Props = $props();

	type AuthStep = 'phone-input' | 'pin-input' | 'setup-profile';

	let authStep = $state<AuthStep>('phone-input');
	let loading = $state(false);
	let error = $state('');

	// Phone auth state — restore from localStorage
	const STORAGE_KEY_PHONE = 'budy_login_phone';
	const STORAGE_KEY_COUNTRY = 'budy_login_country';

	function loadSavedCountry(): Country {
		try {
			const code = localStorage.getItem(STORAGE_KEY_COUNTRY);
			if (code) return COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;
		} catch { /* SSR or storage unavailable */ }
		return DEFAULT_COUNTRY;
	}

	function loadSavedPhone(): string {
		try { return localStorage.getItem(STORAGE_KEY_PHONE) ?? ''; } catch { return ''; }
	}

	let localNumber = $state(loadSavedPhone());
	let selectedCountry = $state<Country>(loadSavedCountry());
	let pin = $state(['', '', '', '']);
	let verificationId = $state('');
	let countdown = $state(0);
	let pinInputEls: HTMLInputElement[] = [];
	let countdownInterval: ReturnType<typeof setInterval> | undefined;

	// Profile setup state
	const ADJECTIVES = [
		'Chill', 'Cosmic', 'Electric', 'Zen', 'Mystic',
		'Funky', 'Smooth', 'Groovy', 'Radiant', 'Stellar',
		'Vibrant', 'Mellow', 'Blazing', 'Frosty', 'Golden',
		'Silver', 'Neon', 'Velvet', 'Crystal', 'Emerald'
	];
	const NOUNS = [
		'Panda', 'Phoenix', 'Dragon', 'Tiger', 'Wolf',
		'Eagle', 'Dolphin', 'Koala', 'Owl', 'Fox',
		'Bear', 'Raven', 'Lion', 'Hawk', 'Otter',
		'Jaguar', 'Lynx', 'Falcon', 'Condor', 'Panther'
	];
	const AVATAR_BASE = 'https://buddy-server.s3.ap-southeast-7.amazonaws.com/host/default-avatars';
	const AVATARS = [
		{ id: 'panda', src: `${AVATAR_BASE}/panda.webp`, label: 'Panda' },
		{ id: 'phoenix', src: `${AVATAR_BASE}/phoenix.webp`, label: 'Phoenix' },
		{ id: 'dragon', src: `${AVATAR_BASE}/dragon.webp`, label: 'Dragon' },
		{ id: 'tiger', src: `${AVATAR_BASE}/tiger.webp`, label: 'Tiger' },
		{ id: 'wolf', src: `${AVATAR_BASE}/wolf.webp`, label: 'Wolf' },
		{ id: 'eagle', src: `${AVATAR_BASE}/eagle.webp`, label: 'Eagle' },
		{ id: 'dolphin', src: `${AVATAR_BASE}/dolphin.webp`, label: 'Dolphin' },
		{ id: 'koala', src: `${AVATAR_BASE}/koala.webp`, label: 'Koala' },
		{ id: 'owl', src: `${AVATAR_BASE}/owl.webp`, label: 'Owl' },
		{ id: 'fox', src: `${AVATAR_BASE}/fox.webp`, label: 'Fox' }
	];

	let displayName = $state(generateRandomName());
	let selectedAvatar = $state(AVATARS[0].src);

	function generateRandomName(): string {
		const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
		const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
		return `${adj} ${noun}`;
	}

	function shuffleName() {
		displayName = generateRandomName();
	}

	const formattedNumber = $derived.by(() => {
		if (!localNumber) return '';
		const d = localNumber;
		if (selectedCountry.code === 'TH' && d.length > 2) {
			if (d.length <= 5) return d.slice(0, 2) + ' ' + d.slice(2);
			return d.slice(0, 2) + ' ' + d.slice(2, 5) + ' ' + d.slice(5);
		}
		return d.replace(/(\d{3})(?=\d)/g, '$1 ');
	});

	const fullPhoneNumber = $derived('+' + selectedCountry.dial + localNumber);
	const canSubmit = $derived(localNumber.length >= 6);

	// Drag-to-dismiss state
	let startY = $state(0);
	let currentY = $state(0);
	let dragging = $state(false);
	let dismissing = $state(false);

	const DISMISS_THRESHOLD = 120;

	const dragOffset = $derived.by(() => {
		if (!dragging) return 0;
		return Math.max(0, currentY - startY);
	});

	const scrimOpacity = $derived.by(() => {
		if (dismissing) return 0;
		if (!dragging) return 1;
		return Math.max(0, 1 - dragOffset / 400);
	});

	function handlePointerDown(e: PointerEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.sheet-handle-zone')) return;
		startY = e.clientY;
		currentY = e.clientY;
		dragging = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging) return;
		currentY = e.clientY;
	}

	function handlePointerUp() {
		if (!dragging) return;
		if (dragOffset > DISMISS_THRESHOLD) {
			dismiss();
		}
		dragging = false;
		startY = 0;
		currentY = 0;
	}

	function dismiss() {
		dismissing = true;
		setTimeout(() => {
			ui.closeLoginSheet();
			resetState();
		}, 300);
	}

	function resetState() {
		authStep = 'phone-input';
		pin = ['', '', '', ''];
		verificationId = '';
		error = '';
		loading = false;
		dismissing = false;
		dragging = false;
		displayName = generateRandomName();
		selectedAvatar = AVATARS[0].src;
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = undefined;
		}
		countdown = 0;
	}

	$effect(() => {
		return () => {
			if (countdownInterval) clearInterval(countdownInterval);
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') dismiss();
	}

	function goBack() {
		if (authStep === 'pin-input') {
			authStep = 'phone-input';
		}
		error = '';
	}

	function handleDigit(digit: string) {
		if (localNumber.length < 12) {
			localNumber += digit;
		}
	}

	function handleBackspace() {
		localNumber = localNumber.slice(0, -1);
	}

	function handlePhonePaste(e: ClipboardEvent) {
		e.preventDefault();
		const pasted = e.clipboardData?.getData('text') ?? '';
		let digits = pasted.replace(/\D/g, '');
		if (digits.startsWith(selectedCountry.dial)) {
			digits = digits.slice(selectedCountry.dial.length);
		}
		localNumber = (localNumber + digits).slice(0, 12);
	}

	async function requestPin() {
		if (!localNumber) {
			error = 'Please enter your phone number.';
			return;
		}

		loading = true;
		error = '';

		try {
			const res = await fetch('/auth/phone/request-pin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phoneNumber: fullPhoneNumber })
			});

			const result = await res.json();

			if (result.success) {
				verificationId = result.verificationId;
				authStep = 'pin-input';
				pin = ['', '', '', ''];
				startCountdown(result.expiresIn ?? 300);
				setTimeout(() => pinInputEls[0]?.focus(), 50);
				try {
					localStorage.setItem(STORAGE_KEY_PHONE, localNumber);
					localStorage.setItem(STORAGE_KEY_COUNTRY, selectedCountry.code);
				} catch { /* storage unavailable */ }
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

		if (value.length > 1) {
			input.value = value[value.length - 1];
		}

		pin[index] = input.value;

		if (input.value && index < 3) {
			pinInputEls[index + 1]?.focus();
		}

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
				if (result.redirectTo?.includes('setup-profile')) {
					authStep = 'setup-profile';
					error = '';
				} else {
					ui.closeLoginSheet();
					resetState();
					await invalidateAll();
				}
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

	async function saveProfile() {
		if (!displayName.trim()) {
			error = 'Please enter a display name.';
			return;
		}

		loading = true;
		error = '';

		try {
			const res = await fetch('/auth/phone/setup-profile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: displayName.trim(),
					avatarPath: selectedAvatar
				})
			});

			const result = await res.json();

			if (result.success) {
				ui.closeLoginSheet();
				resetState();
				await invalidateAll();
			} else {
				error = result.error ?? 'Failed to save profile. Please try again.';
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

<svelte:window onkeydown={handleKeydown} />

<div class="login-overlay">
	<button
		class="login-scrim"
		style="opacity: {scrimOpacity}"
		transition:fade={{ duration: 250 }}
		onclick={dismiss}
		aria-label="Close and return to shop"
	></button>

	<div
		class="login-sheet"
		class:login-sheet--no-transition={dragging}
		class:login-sheet--dismissing={dismissing}
		style="transform: translateY({dragOffset}px)"
		transition:fly={{ y: 600, duration: 350, easing: cubicOut }}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		role="dialog"
		aria-modal="true"
		aria-label="Sign in"
		tabindex="-1"
	>
		<div class="sheet-handle-zone">
			<div class="sheet-handle"></div>
		</div>

		<div class="login-header">
			{#if authStep === 'pin-input'}
				<button class="back-btn" onclick={goBack} aria-label="Go back">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
			{/if}
			<img src={budyLogo} alt="Budy" class="login-logo" />
			<h1 class="login-title">
				{#if authStep === 'setup-profile'}
					Set up your profile
				{:else}
					Welcome to {tenantName}
				{/if}
			</h1>
			<p class="login-subtitle">
				{#if authStep === 'phone-input'}
					Sign in with your phone number
				{:else if authStep === 'pin-input'}
					Enter the verification code
				{:else}
					Pick a name and avatar to get started
				{/if}
			</p>
		</div>

		{#if authStep === 'phone-input'}
			<div class="login-actions">
				<div class="phone-display" role="textbox" tabindex="0" aria-label="Phone number" onpaste={handlePhonePaste}>
					<CountryCodeSelector
						selected={selectedCountry}
						onselect={(c) => selectedCountry = c}
						disabled={loading}
					/>
					<div class="phone-display__number">
						{#if localNumber}
							<span>{formattedNumber}</span>
						{:else}
							<span class="phone-display__placeholder">Phone number</span>
						{/if}
						<span class="phone-display__cursor"></span>
					</div>
				</div>

				<Numpad
					ondigit={handleDigit}
					onbackspace={handleBackspace}
					onsubmit={requestPin}
					submitDisabled={!canSubmit}
					{loading}
				/>
			</div>
		{:else if authStep === 'pin-input'}
			<div class="login-actions">
				<p class="pin-hint">Code sent to <strong>+{selectedCountry.dial} {formattedNumber}</strong></p>

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
		{:else if authStep === 'setup-profile'}
			<div class="login-actions">
				<div class="section">
					<label class="section-label" for="display-name">Display name</label>
					<div class="name-row">
						<input
							id="display-name"
							type="text"
							class="name-input"
							maxlength="100"
							bind:value={displayName}
							onkeydown={(e) => e.key === 'Enter' && saveProfile()}
							disabled={loading}
						/>
						<button
							class="shuffle-btn"
							onclick={shuffleName}
							disabled={loading}
							aria-label="Generate random name"
							title="Random name"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 2v6h6" />
								<path d="M21 12A9 9 0 006 5.3L3 8" />
								<path d="M21 22v-6h-6" />
								<path d="M3 12a9 9 0 0015 6.7l3-2.7" />
							</svg>
						</button>
					</div>
				</div>

				<div class="section">
					<span class="section-label">Choose your avatar</span>
					<div class="avatar-row no-scrollbar">
						{#each AVATARS as avatar (avatar.id)}
							<button
								class="avatar-option"
								class:selected={selectedAvatar === avatar.src}
								onclick={() => (selectedAvatar = avatar.src)}
								disabled={loading}
								aria-label="Select {avatar.label} avatar"
							>
								<img src={avatar.src} alt={avatar.label} class="avatar-img" />
								{#if selectedAvatar === avatar.src}
									<span class="avatar-check">
										<IconCheck class="check-icon" strokeWidth={3} />
									</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<button class="continue-btn" onclick={saveProfile} disabled={loading || !displayName.trim()}>
					{#if loading}
						<div class="btn-spinner"></div>
						Saving...
					{:else}
						Continue
					{/if}
				</button>
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

		{#if authStep !== 'setup-profile'}
			<p class="login-footer">
				By continuing, you agree to the shop's terms and conditions.
			</p>
		{/if}
	</div>
</div>

<style>
	.login-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.login-scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		border: none;
		cursor: default;
		-webkit-tap-highlight-color: transparent;
	}

	.login-sheet {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 480px;
		max-height: 95dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0 2rem 2rem;
		border-radius: 28px 28px 0 0;
		background: var(--md-sys-color-surface-container);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		transition: transform 300ms cubic-bezier(0.2, 0, 0, 1);
		will-change: transform;
		touch-action: pan-x;
	}

	.login-sheet--no-transition {
		transition: none;
	}

	.login-sheet--dismissing {
		transform: translateY(100%) !important;
		transition: transform 300ms cubic-bezier(0.4, 0, 1, 1);
	}

	.sheet-handle-zone {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 12px 0 4px;
		cursor: grab;
		touch-action: none;
	}

	.sheet-handle-zone:active {
		cursor: grabbing;
	}

	.sheet-handle {
		width: 32px;
		height: 4px;
		border-radius: 2px;
		background: var(--md-sys-color-outline-variant);
	}

	.login-header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		position: relative;
		width: 100%;
	}

	.back-btn {
		position: absolute;
		top: 0;
		left: 0;
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
		width: 3rem;
		height: 3rem;
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

	.phone-display {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: 3rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--md-sys-color-outline);
		border-radius: var(--md-sys-shape-corner-medium);
		background: var(--md-sys-color-surface);
	}

	.phone-display__number {
		display: flex;
		align-items: center;
		flex: 1;
		font: var(--md-sys-typescale-body-large);
		color: var(--md-sys-color-on-surface);
		letter-spacing: 0.05em;
	}

	.phone-display__placeholder {
		color: var(--md-sys-color-outline);
	}

	.phone-display__cursor {
		display: inline-block;
		width: 2px;
		height: 1.25em;
		margin-left: 1px;
		background: var(--md-sys-color-primary);
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
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
		padding-bottom: env(safe-area-inset-bottom, 0.5rem);
	}

	/* Profile setup step */
	.section {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-label {
		font: var(--md-sys-typescale-label-large);
		color: var(--md-sys-color-on-surface-variant);
	}

	.name-row {
		display: flex;
		gap: 0.5rem;
	}

	.name-input {
		flex: 1;
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

	.name-input:focus {
		border-color: var(--md-sys-color-primary);
		border-width: 2px;
		padding: 0 calc(1rem - 1px);
	}

	.name-input:disabled {
		opacity: 0.6;
	}

	.shuffle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		flex-shrink: 0;
		border: 1px solid var(--md-sys-color-outline);
		border-radius: var(--md-sys-shape-corner-medium);
		background: transparent;
		color: var(--md-sys-color-on-surface);
		cursor: pointer;
		transition: background 200ms;
	}

	.shuffle-btn:hover:not(:disabled) {
		background: var(--md-sys-color-surface-container-highest);
	}

	.shuffle-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.avatar-row {
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		padding: 0.25rem 0;
	}

	.avatar-option {
		position: relative;
		flex-shrink: 0;
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		border: 2px solid transparent;
		background: transparent;
		padding: 0;
		cursor: pointer;
		transition: border-color 200ms, transform 200ms;
	}

	.avatar-option:hover:not(:disabled) {
		transform: scale(1.08);
	}

	.avatar-option.selected {
		border-color: var(--md-sys-color-primary);
	}

	.avatar-option:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-check {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: var(--md-sys-color-primary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-check :global(.check-icon) {
		width: 0.75rem;
		height: 0.75rem;
		color: var(--md-sys-color-on-primary);
	}

	.continue-btn {
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

	.continue-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.continue-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid var(--md-sys-color-on-primary);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 600ms linear infinite;
	}
</style>
