<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import { getCartItemPrice, getCartItemName, getCartItemId } from '$lib/types/cart.js';
	import { IconChevronLeft, IconClose, IconStore, IconDelivery, IconCheck } from '$lib/components/icons/index.js';

	const subtotal = $derived(cart.totalPrice);
	const taxRate = 0;
	const taxAmount = $derived(subtotal * taxRate);
	const total = $derived(subtotal + taxAmount);
	const canPlaceOrder = $derived(ui.selectedDeliveryOption === 'pickup');

	async function handlePlaceOrder() {
		if (!canPlaceOrder) return;
		ui.startProcessing();
		await new Promise((resolve) => setTimeout(resolve, 1500));
		cart.clear();
		ui.showSuccess();
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
		<!-- Order summary -->
		<div class="checkout-section">
			<h3 class="checkout-section__title">Order Summary</h3>
			<div class="checkout-items">
				{#each cart.items as item (getCartItemId(item))}
					<div class="checkout-item">
						<span class="checkout-item__desc">
							{getCartItemName(item)}
							<span class="checkout-item__qty">x{item.quantity}</span>
						</span>
						<span class="checkout-item__price">{formatPrice(getCartItemPrice(item) * item.quantity)}</span>
					</div>
				{/each}
			</div>
		</div>

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

				<!-- Deliver (disabled) -->
				<div class="delivery-card delivery-card--disabled">
					<div class="delivery-card__badge">Coming Soon</div>
					<IconDelivery class="delivery-card__icon" />
					<span class="delivery-card__label">Deliver</span>
				</div>
			</div>
		</div>
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
				Place Order
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

	/* --- Order items --- */
	.checkout-items {
		padding: 12px 16px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--md-sys-color-surface-container) 90%, transparent);
	}

	.checkout-items > :global(* + *) {
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 20%, transparent);
	}

	.checkout-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
	}

	.checkout-item__desc {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}

	.checkout-item__qty {
		margin-left: 6px;
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--md-sys-color-outline);
	}

	.checkout-item__price {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
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

	.delivery-card--disabled {
		opacity: 0.4;
		cursor: not-allowed;
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

	.delivery-card__badge {
		position: absolute;
		top: 8px;
		right: 8px;
		padding: 2px 8px;
		border-radius: 9999px;
		background: var(--md-sys-color-surface-container-highest);
		font-size: 0.625rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface-variant);
		text-transform: uppercase;
		letter-spacing: 0.04em;
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
</style>
