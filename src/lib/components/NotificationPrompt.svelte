<script lang="ts">
	import { notifications } from '$lib/stores/notifications.svelte.js';
	import { getTenantContext } from '$lib/stores/tenant.svelte.js';
	import { fly } from 'svelte/transition';

	interface Props {
		/** Optional member ID for backend registration */
		memberId?: string;
	}

	let { memberId }: Props = $props();

	const tenant = getTenantContext();

	async function handleEnable() {
		await notifications.subscribe(memberId);
	}
</script>

{#if notifications.canPrompt}
	<div class="notification-banner" transition:fly={{ y: 80, duration: 300 }}>
		<div class="notification-icon-container">
			<svg class="notification-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
			</svg>
		</div>
		<div class="notification-text">
			<span class="notification-title">Stay updated</span>
			<span class="notification-subtitle">Get notified when your order is ready!</span>
		</div>
		<div class="notification-actions">
			<button class="btn-dismiss" onclick={() => notifications.dismiss()}>Not now</button>
			<button class="btn-enable" onclick={handleEnable} disabled={notifications.isSubscribing}>
				{#if notifications.isSubscribing}
					Enabling...
				{:else}
					Enable
				{/if}
			</button>
		</div>
	</div>
{/if}

<style>
	.notification-banner {
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

	.notification-icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: var(--md-sys-color-primary-container);
		flex-shrink: 0;
	}

	.notification-icon {
		width: 22px;
		height: 22px;
		color: var(--md-sys-color-on-primary-container);
	}

	.notification-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.notification-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.notification-subtitle {
		font-size: 0.75rem;
		color: var(--md-sys-color-outline);
	}

	.notification-actions {
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

	.btn-enable {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		border: none;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.5rem 1rem;
		border-radius: 8px;
	}

	.btn-enable:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.btn-enable:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
