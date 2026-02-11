<script lang="ts">
	import { addressStore } from '$lib/stores/addresses.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import AddressCard from './AddressCard.svelte';
	import { IconPlus } from '$lib/components/icons/index.js';

	let deleting = $state<string | null>(null);

	function handleEdit(id: string) {
		ui.showAddressForm('edit', id);
	}

	async function handleDelete(id: string) {
		deleting = id;
		await addressStore.remove(id);
		deleting = null;
	}
</script>

<div class="address-list">
	{#if addressStore.loading}
		<div class="address-list__loading">
			<div class="address-list__spinner"></div>
			<span class="address-list__loading-text">Loading addresses...</span>
		</div>
	{:else if addressStore.addresses.length === 0}
		<div class="address-list__empty">
			<svg class="address-list__empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
				<path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
				<path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
			</svg>
			<p class="address-list__empty-title">No addresses yet</p>
			<p class="address-list__empty-text">Add a delivery address to get started.</p>
		</div>
	{:else}
		<div class="address-list__items">
			{#each addressStore.addresses as address (address.id)}
				<div class="address-list__item" class:address-list__item--deleting={deleting === address.id}>
					<AddressCard
						{address}
						onedit={() => handleEdit(address.id)}
						ondelete={() => handleDelete(address.id)}
					/>
				</div>
			{/each}
		</div>
	{/if}

	{#if addressStore.error}
		<p class="address-list__error">{addressStore.error}</p>
	{/if}

	<button class="address-list__add-btn" onclick={() => ui.showAddressForm('create')}>
		<IconPlus class="address-list__add-icon" />
		<span>Add New Address</span>
	</button>
</div>

<style>
	.address-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.address-list__items {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.address-list__item {
		transition: opacity 200ms ease;
	}

	.address-list__item--deleting {
		opacity: 0.5;
		pointer-events: none;
	}

	/* Loading */
	.address-list__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 32px 0;
	}

	.address-list__spinner {
		width: 28px;
		height: 28px;
		border: 3px solid var(--md-sys-color-outline-variant);
		border-top-color: var(--md-sys-color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.address-list__loading-text {
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}

	/* Empty */
	.address-list__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 32px 0;
		text-align: center;
	}

	.address-list__empty-icon {
		width: 48px;
		height: 48px;
		color: var(--md-sys-color-outline-variant);
		margin-bottom: 4px;
	}

	.address-list__empty-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.address-list__empty-text {
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}

	/* Error */
	.address-list__error {
		padding: 10px 14px;
		border-radius: 10px;
		background: var(--md-sys-color-error-container);
		color: var(--md-sys-color-on-error-container);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	/* Add button */
	.address-list__add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 12px;
		border-radius: 12px;
		border: 1.5px dashed var(--md-sys-color-outline-variant);
		background: transparent;
		color: var(--md-sys-color-primary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 150ms ease, border-color 150ms ease;
	}

	.address-list__add-btn:hover {
		background: color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent);
		border-color: var(--md-sys-color-primary);
	}

	:global(.address-list__add-icon) {
		width: 18px;
		height: 18px;
	}
</style>
