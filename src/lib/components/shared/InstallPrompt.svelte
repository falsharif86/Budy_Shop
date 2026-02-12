<script lang="ts">
	import { pwa } from '$lib/stores/pwa.svelte.js';
	import { getTenantContext } from '$lib/stores/tenant.svelte.js';
	import { fly } from 'svelte/transition';

	const tenant = getTenantContext();
</script>

{#if pwa.canInstall}
	<div class="install-banner" transition:fly={{ y: 80, duration: 300 }}>
		<img src="/icon-48.png" alt="Budy" class="install-icon" />
		<div class="install-text">
			<span class="install-title">{tenant.value?.name ?? 'Budy Shop'}</span>
			<span class="install-subtitle">Install app for quick access</span>
		</div>
		<div class="install-actions">
			<button class="btn-dismiss" onclick={() => pwa.dismiss()}>Not now</button>
			<button class="btn-install" onclick={() => pwa.install()}>Install</button>
		</div>
	</div>
{/if}

<style>
	.install-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: var(--md-sys-color-surface-container);
		border-top: 1px solid var(--md-sys-color-outline-variant);
	}

	.install-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.install-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.install-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.install-subtitle {
		font-size: 0.75rem;
		color: var(--md-sys-color-outline);
	}

	.install-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.btn-dismiss {
		background: none;
		border: none;
		color: var(--md-sys-color-outline);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
	}

	.btn-dismiss:hover {
		background: var(--md-sys-color-surface-container-high);
	}

	.btn-install {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		border: none;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.5rem 1rem;
		border-radius: 8px;
	}

	.btn-install:hover {
		filter: brightness(1.1);
	}
</style>
