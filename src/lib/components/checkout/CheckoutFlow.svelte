<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import { getCartItemPrice, getCartItemName } from '$lib/types/cart.js';
	import OrderSuccess from './OrderSuccess.svelte';

	type CheckoutStep = 'review' | 'payment' | 'processing' | 'success';

	let step = $state<CheckoutStep>('review');
	let selectedPayment = $state<'cash' | 'card' | null>(null);

	interface Props {
		onback: () => void;
	}

	let { onback }: Props = $props();

	async function handlePlaceOrder() {
		if (!selectedPayment) return;
		step = 'processing';

		// Simulate order submission (backend endpoint needed)
		await new Promise((resolve) => setTimeout(resolve, 2000));

		step = 'success';
		cart.clear();
	}

	function handleContinueShopping() {
		step = 'review';
		selectedPayment = null;
		onback();
	}
</script>

<div class="checkout mx-auto max-w-lg px-4 py-6">
	{#if step === 'review'}
		<!-- Order Review -->
		<h2 class="checkout__heading">Order Review</h2>

		<div class="checkout__items-card">
			{#each cart.items as item (item.variant ? `${item.product.id}:${item.variant.id}` : item.product.id)}
				<div class="checkout__item">
					<div>
						<span class="checkout__item-name">{getCartItemName(item)}</span>
						<span class="checkout__item-qty">x{item.quantity}</span>
					</div>
					<span class="checkout__item-price">{formatPrice(getCartItemPrice(item) * item.quantity)}</span>
				</div>
			{/each}
		</div>

		<div class="checkout__total-row mb-6">
			<span>Total</span>
			<span>{formatPrice(cart.totalPrice)}</span>
		</div>

		<!-- Payment selection -->
		<h3 class="checkout__section-heading">Payment Method</h3>
		<div class="checkout__payment-list">
			<button
				class="payment-option"
				class:selected={selectedPayment === 'cash'}
				onclick={() => (selectedPayment = 'cash')}
			>
				<svg class="payment-option__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
				</svg>
				<div class="text-left">
					<span class="payment-option__name">Cash</span>
					<span class="payment-option__desc">Pay at pickup</span>
				</div>
			</button>

			<button
				class="payment-option"
				class:selected={selectedPayment === 'card'}
				onclick={() => (selectedPayment = 'card')}
			>
				<svg class="payment-option__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
				</svg>
				<div class="text-left">
					<span class="payment-option__name">Card</span>
					<span class="payment-option__desc">Pay online</span>
				</div>
			</button>
		</div>

		<!-- Actions -->
		<div class="checkout__actions">
			<button class="checkout__back-btn" onclick={onback}>
				Back
			</button>
			<button
				class="place-order-btn"
				class:enabled={selectedPayment}
				disabled={!selectedPayment}
				onclick={handlePlaceOrder}
			>
				Place Order
			</button>
		</div>
	{:else if step === 'processing'}
		<!-- Processing -->
		<div class="checkout__processing">
			<div class="checkout__spinner"></div>
			<p class="checkout__processing-text">Processing your order...</p>
		</div>
	{:else if step === 'success'}
		<OrderSuccess oncontinue={handleContinueShopping} />
	{/if}
</div>

<style>
	.checkout__heading {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		margin-bottom: 24px;
	}

	.checkout__items-card {
		margin-bottom: 24px;
		padding: 16px;
		border-radius: var(--md-sys-shape-corner-large, 16px);
		background: var(--md-sys-color-surface-container);
	}

	.checkout__items-card > * + * {
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 20%, transparent);
	}

	.checkout__item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
	}

	.checkout__item-name {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.checkout__item-qty {
		margin-left: 8px;
		font-size: 0.75rem;
		color: var(--md-sys-color-outline);
	}

	.checkout__item-price {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.checkout__total-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 1.125rem;
		font-weight: 700;
	}

	.checkout__section-heading {
		font-size: 1rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
		margin-bottom: 12px;
	}

	.checkout__payment-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 24px;
	}

	/* --- Payment option --- */
	.payment-option {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-radius: var(--md-sys-shape-corner-medium, 12px);
		border: 1px solid var(--md-sys-color-outline-variant);
		transition: all 0.15s ease;
	}

	.payment-option.selected {
		border-color: var(--md-sys-color-primary);
		background: var(--md-sys-color-primary-container);
	}

	.payment-option__icon {
		width: 24px;
		height: 24px;
	}

	.payment-option__name {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.payment-option__desc {
		display: block;
		font-size: 0.75rem;
		color: var(--md-sys-color-outline);
	}

	/* --- Actions --- */
	.checkout__actions {
		display: flex;
		gap: 12px;
	}

	.checkout__back-btn {
		flex: 1;
		padding: 12px;
		border-radius: 9999px;
		border: 1px solid var(--md-sys-color-outline-variant);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}

	.place-order-btn {
		flex: 1;
		padding: 12px;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-outline);
		opacity: 0.6;
		transition: opacity 0.15s ease;
	}

	.place-order-btn.enabled {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		opacity: 1;
	}

	.place-order-btn:disabled {
		cursor: not-allowed;
	}

	/* --- Processing --- */
	.checkout__processing {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 0;
	}

	.checkout__spinner {
		width: 48px;
		height: 48px;
		margin-bottom: 24px;
		border: 4px solid var(--md-sys-color-surface-container);
		border-top-color: var(--md-sys-color-primary);
		border-radius: 9999px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.checkout__processing-text {
		font-size: 1rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}
</style>
