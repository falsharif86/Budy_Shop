<script lang="ts">
	import { goto } from '$app/navigation';
	import budyLogo from '$lib/assets/budy_logo.svg';
	import { IconCheck } from '$lib/components/icons/index.js';

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

	const AVATARS = [
		{ id: 'panda', src: '/avatars/panda.webp', label: 'Panda' },
		{ id: 'phoenix', src: '/avatars/phoenix.webp', label: 'Phoenix' },
		{ id: 'dragon', src: '/avatars/dragon.webp', label: 'Dragon' },
		{ id: 'tiger', src: '/avatars/tiger.webp', label: 'Tiger' },
		{ id: 'wolf', src: '/avatars/wolf.webp', label: 'Wolf' },
		{ id: 'eagle', src: '/avatars/eagle.webp', label: 'Eagle' },
		{ id: 'dolphin', src: '/avatars/dolphin.webp', label: 'Dolphin' },
		{ id: 'koala', src: '/avatars/koala.webp', label: 'Koala' },
		{ id: 'owl', src: '/avatars/owl.webp', label: 'Owl' },
		{ id: 'fox', src: '/avatars/fox.webp', label: 'Fox' }
	];

	let { data } = $props();

	let displayName = $state(generateRandomName());
	let selectedAvatar = $state(AVATARS[0].src);
	let loading = $state(false);
	let error = $state('');

	const tenantName = $derived(data.tenant?.name ?? 'Shop');

	function generateRandomName(): string {
		const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
		const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
		return `${adj} ${noun}`;
	}

	function shuffleName() {
		displayName = generateRandomName();
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
				await goto('/', { replaceState: true, invalidateAll: true });
			} else {
				error = result.error ?? 'Failed to save profile. Please try again.';
			}
		} catch {
			error = 'Network error. Please check your connection and try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Set up your profile | {tenantName} | Budy</title>
</svelte:head>

<div class="setup-page">
	<div class="setup-card">
		<div class="setup-header">
			<img src={budyLogo} alt="Budy" class="setup-logo" />
			<h1 class="setup-title">Set up your profile</h1>
			<p class="setup-subtitle">Pick a name and avatar to get started</p>
		</div>

		<!-- Name Section -->
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

		<!-- Avatar Section -->
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

		{#if error}
			<div class="setup-error" role="alert">
				<svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		<button class="continue-btn" onclick={saveProfile} disabled={loading || !displayName.trim()}>
			{#if loading}
				<div class="spinner"></div>
				Saving...
			{:else}
				Continue
			{/if}
		</button>
	</div>
</div>

<style>
	.setup-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: 1.5rem;
	}

	.setup-card {
		width: 100%;
		max-width: 480px;
		padding: 2.5rem 2rem;
		border-radius: var(--md-sys-shape-corner-xl);
		background: var(--md-sys-color-surface-container);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.setup-header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.setup-logo {
		width: 3.5rem;
		height: 3.5rem;
		margin-bottom: 0.5rem;
	}

	.setup-title {
		font: var(--md-sys-typescale-headline-small);
		color: var(--md-sys-color-on-surface);
	}

	.setup-subtitle {
		font: var(--md-sys-typescale-body-medium);
		color: var(--md-sys-color-outline);
	}

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

	.spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid var(--md-sys-color-on-primary);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 600ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.setup-error {
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
</style>
