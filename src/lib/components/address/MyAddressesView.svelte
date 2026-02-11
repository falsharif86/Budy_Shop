<script lang="ts">
	import { ui } from '$lib/stores/ui.svelte.js';
	import { addressStore } from '$lib/stores/addresses.svelte.js';
	import { IconClose } from '$lib/components/icons/index.js';
	import AddressList from './AddressList.svelte';
	import AddressForm from './AddressForm.svelte';
	import type { CreateAddressPayload } from '$lib/types/address.js';

	const editingAddress = $derived(
		ui.addressFormMode === 'edit' && ui.editingAddressId
			? addressStore.addresses.find((a) => a.id === ui.editingAddressId) ?? null
			: null
	);

	async function handleSave(payload: CreateAddressPayload) {
		if (ui.addressFormMode === 'edit' && ui.editingAddressId) {
			const ok = await addressStore.update(ui.editingAddressId, payload);
			if (ok) ui.showAddressList();
		} else {
			const created = await addressStore.create(payload);
			if (created) ui.showAddressList();
		}
	}
</script>

<div class="my-addresses">
	{#if ui.addressFormMode === 'list'}
		<!-- List view -->
		<div class="my-addresses__header">
			<h2 class="my-addresses__title">My Addresses</h2>
			<button class="my-addresses__close" onclick={() => ui.closeAddressDrawer()} aria-label="Close">
				<IconClose class="my-addresses__close-icon" />
			</button>
		</div>
		<div class="my-addresses__content">
			<AddressList />
		</div>
	{:else}
		<!-- Create / Edit view -->
		<AddressForm
			editAddress={editingAddress}
			onsave={handleSave}
			oncancel={() => ui.showAddressList()}
		/>
	{/if}
</div>

<style>
	.my-addresses {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.my-addresses__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.my-addresses__title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.my-addresses__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 9999px;
		transition: background-color 0.15s ease;
	}

	.my-addresses__close:hover {
		background: var(--md-sys-color-surface-container);
	}

	:global(.my-addresses__close-icon) {
		width: 20px;
		height: 20px;
	}

	.my-addresses__content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}
</style>
