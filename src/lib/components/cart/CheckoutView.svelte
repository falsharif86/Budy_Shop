<script lang="ts">
	import { page } from '$app/state';
	import { cart } from '$lib/stores/cart.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import { orderStore } from '$lib/stores/orders.svelte.js';
	import { addressStore } from '$lib/stores/addresses.svelte.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import { getCartItemPrice } from '$lib/types/cart.js';
	import type { OnlineOrderDetail } from '$lib/types/order.js';
	import type { MemberAddress } from '$lib/types/address.js';
	import { IconChevronLeft, IconClose, IconStore, IconDelivery, IconCheck, IconPlus } from '$lib/components/icons/index.js';
	import AddressCard from '$lib/components/address/AddressCard.svelte';

	const user = $derived(page.data.user);
	const subtotal = $derived(cart.totalPrice);
	const taxRate = 0;
	const taxAmount = $derived(subtotal * taxRate);
	const total = $derived(subtotal + taxAmount);

	let customerNotes = $state('');
	let submitting = $state(false);
	let errorMessage = $state<string | null>(null);
	let selectedAddressId = $state<string | null>(null);

	const isPickup = $derived(ui.selectedDeliveryOption === 'pickup');
	const isDelivery = $derived(ui.selectedDeliveryOption === 'delivery');

	const selectedAddress = $derived<MemberAddress | null>(
		selectedAddressId
			? addressStore.addresses.find((a) => a.id === selectedAddressId) ?? null
			: null
	);

	// Auto-select default address when delivery is chosen
	$effect(() => {
		if (isDelivery && !selectedAddressId && addressStore.defaultAddress) {
			selectedAddressId = addressStore.defaultAddress.id;
		}
	});

	const canPlaceOrder = $derived(
		!submitting &&
		(isPickup || (isDelivery && !!selectedAddress))
	);

	async function handlePlaceOrder() {
		if (!canPlaceOrder) return;
		errorMessage = null;
		submitting = true;
		ui.startProcessing();

		try {
			const body: Record<string, unknown> = {
				items: cart.items.map((item) => ({
					productId: item.product.id,
					variantId: item.variant?.id ?? null,
					quantity: item.quantity,
					unitPrice: getCartItemPrice(item)
				})),
				fulfillmentType: isDelivery ? 1 : 0,
				customerName: null,
				customerPhone: null,
				customerNotes: customerNotes.trim() || null
			};

			if (user) {
				body.memberEmail = user.email;
				body.memberName = user.name || null;
				body.memberPhotoUrl = user.picture || null;
				if (!body.customerName) {
					body.customerName = user.name || null;
				}
				if (!body.customerPhone) {
					body.customerPhone = user.phoneNumber || null;
				}
			}
			if (addressStore.memberId) {
				body.memberId = addressStore.memberId;
			}

			if (isDelivery && selectedAddress) {
				body.deliveryAddress = {
					label: selectedAddress.label,
					streetAddress: selectedAddress.streetAddress,
					houseNumber: selectedAddress.houseNumber,
					floor: selectedAddress.floor,
					building: selectedAddress.building,
					city: selectedAddress.city,
					postalCode: selectedAddress.postalCode,
					country: selectedAddress.country,
					latitude: selectedAddress.latitude,
					longitude: selectedAddress.longitude
				};
			}

			const res = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(data?.error ?? `Order failed (${res.status})`);
			}

			const detail: OnlineOrderDetail = await res.json();
			orderStore.addOrder(detail);
			cart.clear();
			customerNotes = '';
			selectedAddressId = null;
			ui.showSuccess();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
			ui.startCheckout();
		} finally {
			submitting = false;
		}
	}

	function dismissError() {
		errorMessage = null;
	}

	function handleAddAddress() {
		ui.closeCartDrawer();
		setTimeout(() => ui.openAddressDrawer(), 200);
		setTimeout(() => ui.showAddressForm('create'), 250);
	}
</script>

<div class="checkout">
	<!-- Header -->
	<div class="checkout-header">
		<button
			class="checkout-header__back-btn"
			onclick={() => ui.backToCart()}
			aria-label="Back to cart"
		>
			<IconChevronLeft class="checkout-header__back-icon" />
		</button>
		<h2 class="checkout-header__text">Checkout</h2>
		<button
			class="checkout-header__close-btn"
			onclick={() => ui.closeCartDrawer()}
			aria-label="Close"
		>
			<IconClose class="checkout-header__close-icon" />
		</button>
	</div>

	<!-- Scrollable content -->
	<div class="checkout-scroll">
		<!-- Error banner -->
		{#if errorMessage}
			<div class="error-banner">
				<span class="error-banner__text">{errorMessage}</span>
				<button class="error-banner__dismiss" onclick={dismissError} aria-label="Dismiss error">
					<IconClose class="error-banner__dismiss-icon" />
				</button>
			</div>
		{/if}

		<!-- Totals -->
		<div class="checkout-totals">
			<div class="checkout-totals__row">
				<span class="checkout-totals__label">Subtotal</span>
				<span class="checkout-totals__value">{formatPrice(subtotal)}</span>
			</div>
			<div class="checkout-totals__row">
				<span class="checkout-totals__label">Tax (0%)</span>
				<span class="checkout-totals__value">{formatPrice(taxAmount)}</span>
			</div>
			<div class="checkout-totals__divider"></div>
			<div class="checkout-totals__row">
				<span class="checkout-totals__total-label">Total</span>
				<span class="checkout-totals__total-value">{formatPrice(total)}</span>
			</div>
		</div>

		<!-- Delivery options -->
		<div class="checkout-section">
			<h3 class="checkout-section__title">
				<svg class="checkout-section__title-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
					<path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
				</svg>
				Delivery Option
			</h3>
			<div class="delivery-grid">
				<!-- Pick up at Store -->
				<button
					class="delivery-card"
					class:delivery-card--selected={ui.selectedDeliveryOption === 'pickup'}
					onclick={() => ui.setDeliveryOption('pickup')}
				>
					{#if ui.selectedDeliveryOption === 'pickup'}
						<div class="delivery-card__check">
							<IconCheck class="delivery-card__check-icon" />
						</div>
					{/if}
					<IconStore class="delivery-card__icon" />
					<span class="delivery-card__label">Pick up at Store</span>
				</button>

				<!-- Deliver -->
				<button
					class="delivery-card"
					class:delivery-card--selected={isDelivery}
					onclick={() => ui.setDeliveryOption('delivery')}
				>
					{#if isDelivery}
						<div class="delivery-card__check">
							<IconCheck class="delivery-card__check-icon" />
						</div>
					{/if}
					<IconDelivery class="delivery-card__icon" />
					<span class="delivery-card__label">Deliver</span>
				</button>
			</div>

			<!-- Address selection for delivery -->
			{#if isDelivery}
				<div class="delivery-addresses">
					{#if addressStore.addresses.length > 0}
						<div class="delivery-addresses__list">
							{#each addressStore.addresses as address (address.id)}
								<AddressCard
									{address}
									selectable
									selected={selectedAddressId === address.id}
									onselect={() => (selectedAddressId = address.id)}
								/>
							{/each}
						</div>
					{:else}
						<p class="delivery-addresses__empty">No saved addresses. Add one to continue.</p>
					{/if}
					<button class="delivery-addresses__add" onclick={handleAddAddress}>
						<IconPlus class="delivery-addresses__add-icon" />
						<span>Add New Address</span>
					</button>
				</div>
			{/if}
		</div>

		<!-- Order notes (visible when option selected) -->
		{#if isPickup || isDelivery}
			<div class="checkout-section contact-section">
				<h3 class="checkout-section__title">
					<svg class="checkout-section__title-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
					</svg>
					Order Notes
				</h3>
				<div class="contact-fields">
					<div class="field">
						<label class="field__label" for="checkout-notes">Notes <span class="field__optional">(optional)</span></label>
						<textarea
							id="checkout-notes"
							class="field__textarea"
							placeholder="Special requests..."
							rows="2"
							bind:value={customerNotes}
						></textarea>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div class="checkout-footer">
		<div class="checkout-actions">
			<button
				class="checkout-btn checkout-btn--back"
				onclick={() => ui.backToCart()}
			>
				Back
			</button>
			<button
				class="checkout-btn checkout-btn--place"
				class:checkout-btn--enabled={canPlaceOrder}
				disabled={!canPlaceOrder}
				onclick={handlePlaceOrder}
			>
				{#if submitting}
					Placing...
				{:else}
					Place Order
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
	.checkout {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	/* --- Header --- */
	.checkout-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.checkout-header__back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 9999px;
		transition: background-color 0.15s ease;
	}

	.checkout-header__back-btn:hover {
		background: var(--md-sys-color-surface-container);
	}

	:global(.checkout-header__back-icon) {
		width: 20px;
		height: 20px;
		color: var(--md-sys-color-on-surface);
	}

	.checkout-header__text {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.checkout-header__close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 9999px;
		transition: background-color 0.15s ease;
	}

	.checkout-header__close-btn:hover {
		background: var(--md-sys-color-surface-container);
	}

	:global(.checkout-header__close-icon) {
		width: 20px;
		height: 20px;
	}

	/* --- Scrollable content --- */
	.checkout-scroll {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	/* --- Error banner --- */
	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		margin-bottom: 16px;
		border-radius: 12px;
		background: var(--md-sys-color-error-container);
		color: var(--md-sys-color-on-error-container);
	}

	.error-banner__text {
		flex: 1;
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.error-banner__dismiss {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 9999px;
		flex-shrink: 0;
		transition: background-color 0.15s ease;
	}

	.error-banner__dismiss:hover {
		background: color-mix(in srgb, var(--md-sys-color-on-error-container) 10%, transparent);
	}

	:global(.error-banner__dismiss-icon) {
		width: 16px;
		height: 16px;
	}

	/* --- Sections --- */
	.checkout-section {
		margin-bottom: 20px;
	}

	.checkout-section__title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface-variant);
		margin-bottom: 12px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.checkout-section__title-icon {
		width: 18px;
		height: 18px;
	}

	/* --- Totals --- */
	.checkout-totals {
		margin-bottom: 20px;
		padding: 16px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--md-sys-color-surface-container) 90%, transparent);
	}

	.checkout-totals__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.checkout-totals__row + .checkout-totals__row {
		margin-top: 6px;
	}

	.checkout-totals__label {
		font-size: 0.875rem;
		color: var(--md-sys-color-on-surface-variant);
	}

	.checkout-totals__value {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}

	.checkout-totals__divider {
		margin: 12px 0;
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.checkout-totals__total-label {
		font-size: 1rem;
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
	}

	.checkout-totals__total-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--md-sys-color-primary);
	}

	/* --- Delivery grid --- */
	.delivery-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.delivery-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 20px 12px;
		border-radius: 12px;
		background: var(--md-sys-color-surface-container);
		border: 1.5px solid var(--md-sys-color-outline-variant);
		transition: border-color 200ms ease, background-color 150ms ease;
		cursor: pointer;
	}

	.delivery-card:hover:not(.delivery-card--disabled) {
		border-color: var(--md-sys-color-outline);
	}

	.delivery-card--selected {
		border: 2px solid var(--md-sys-color-primary);
		background: color-mix(in srgb, var(--md-sys-color-primary-container) 30%, transparent);
	}

	.delivery-card--selected:hover {
		border-color: var(--md-sys-color-primary);
	}

	:global(.delivery-card__icon) {
		width: 32px;
		height: 32px;
		color: var(--md-sys-color-on-surface-variant);
	}

	.delivery-card--selected :global(.delivery-card__icon) {
		color: var(--md-sys-color-primary);
	}

	.delivery-card__label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}

	.delivery-card__check {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 9999px;
		background: var(--md-sys-color-primary);
	}

	:global(.delivery-card__check-icon) {
		width: 14px;
		height: 14px;
		color: var(--md-sys-color-on-primary);
	}

	/* --- Contact fields --- */
	.contact-section {
		animation: slide-in 200ms ease-out;
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.contact-fields {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.field__label {
		display: block;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
		margin-bottom: 6px;
	}

	.field__optional {
		font-weight: 400;
		color: var(--md-sys-color-outline);
	}

	.field__textarea {
		width: 100%;
		padding: 10px 14px;
		border-radius: 10px;
		border: 1.5px solid var(--md-sys-color-outline-variant);
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);
		font-size: 0.875rem;
		font-family: inherit;
		transition: border-color 150ms ease;
		box-sizing: border-box;
		resize: vertical;
		min-height: 60px;
	}

	.field__textarea:focus {
		outline: none;
		border-color: var(--md-sys-color-primary);
	}

	/* --- Footer --- */
	.checkout-footer {
		background: var(--md-sys-color-surface);
		padding: 12px 16px 24px;
	}

	.checkout-actions {
		display: flex;
		gap: 12px;
	}

	.checkout-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 56px;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 500;
		transition: transform 0.1s ease;
	}

	.checkout-btn:active {
		transform: scale(0.98);
	}

	.checkout-btn--back {
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);
		border: 1px solid var(--md-sys-color-outline-variant);
	}

	.checkout-btn--place {
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-outline);
		opacity: 0.6;
	}

	.checkout-btn--place:disabled {
		cursor: not-allowed;
	}

	.checkout-btn--enabled {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		opacity: 1;
		box-shadow: 0 4px 12px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
	}

	/* --- Delivery addresses --- */
	.delivery-addresses {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 12px;
		animation: slide-in 200ms ease-out;
	}

	.delivery-addresses__list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.delivery-addresses__empty {
		padding: 16px;
		text-align: center;
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}

	.delivery-addresses__add {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px;
		border-radius: 10px;
		border: 1.5px dashed var(--md-sys-color-outline-variant);
		background: transparent;
		color: var(--md-sys-color-primary);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 150ms ease, border-color 150ms ease;
	}

	.delivery-addresses__add:hover {
		background: color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent);
		border-color: var(--md-sys-color-primary);
	}

	:global(.delivery-addresses__add-icon) {
		width: 16px;
		height: 16px;
	}
</style>
