<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Drawer from '$lib/components/shared/Drawer.svelte';
	import CartItemComponent from './CartItem.svelte';
	import CheckoutView from './CheckoutView.svelte';
	import OrderProcessing from './OrderProcessing.svelte';
	import OrderSuccess from './OrderSuccess.svelte';
	import { cart } from '$lib/stores/cart.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import { IconCart, IconClose, IconTrash } from '$lib/components/icons/index.js';

	const subtotal = $derived(cart.totalPrice);
	const taxRate = 0;
	const taxAmount = $derived(subtotal * taxRate);
	const total = $derived(subtotal + taxAmount);

	function handleCheckout() {
		if (!page.data.user) {
			ui.closeCartDrawer();
			goto('/auth/login');
			return;
		}
		ui.startCheckout();
	}

	function handleContinueShopping() {
		ui.resetCheckout();
		ui.closeCartDrawer();
	}
</script>

<Drawer open={ui.cartDrawerOpen} onclose={() => ui.closeCartDrawer()} zIndex={40}>
	{#if ui.checkoutStep === 'cart'}
		<div class="cart-drawer">
			<!-- Header -->
			<div class="cart-header">
				<div class="cart-header__title">
					<IconCart class="cart-header__icon" />
					<h2 class="cart-header__text">Cart ({cart.totalItems})</h2>
				</div>
				<button
					class="cart-header__close-btn"
					onclick={() => ui.closeCartDrawer()}
					aria-label="Close cart"
				>
					<IconClose class="cart-header__close-icon" />
				</button>
			</div>

			<!-- Items -->
			<div class="cart-items">
				{#if cart.isEmpty}
					<div class="cart-empty">
						<IconCart class="cart-empty__icon" strokeWidth={1} />
						<p class="cart-empty__title">Your cart is empty</p>
						<p class="cart-empty__subtitle">Add some products to get started</p>
						<button
							class="cart-empty__btn"
							onclick={() => ui.closeCartDrawer()}
						>
							Continue Shopping
						</button>
					</div>
				{:else}
					<div class="cart-items__list">
						{#each cart.items as item (item.variant ? `${item.product.id}:${item.variant.id}` : item.product.id)}
							<CartItemComponent {item} />
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer with totals card + dual action buttons -->
			{#if !cart.isEmpty}
				<div class="cart-footer">
					<!-- Totals card -->
					<div class="cart-totals">
						<div class="cart-totals__row">
							<span class="cart-totals__label">Subtotal</span>
							<span class="cart-totals__value">{formatPrice(subtotal)}</span>
						</div>
						<div class="cart-totals__row">
							<span class="cart-totals__label">Tax (0%)</span>
							<span class="cart-totals__value">{formatPrice(taxAmount)}</span>
						</div>
						<div class="cart-totals__divider"></div>
						<div class="cart-totals__row">
							<span class="cart-totals__total-label">Total</span>
							<span class="cart-totals__total-value">{formatPrice(total)}</span>
						</div>
					</div>

					<!-- Dual action buttons -->
					<div class="cart-actions">
						<button
							class="cart-action-btn cart-action-btn--clear"
							onclick={() => cart.clear()}
						>
							<IconTrash class="cart-action-btn__icon" />
							Clear
						</button>

						<button
							class="cart-action-btn cart-action-btn--checkout"
							onclick={handleCheckout}
						>
							<svg class="cart-action-btn__icon-inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
							</svg>
							Checkout
						</button>
					</div>
				</div>
			{/if}
		</div>
	{:else if ui.checkoutStep === 'checkout'}
		<CheckoutView />
	{:else if ui.checkoutStep === 'processing'}
		<div class="cart-drawer">
			<OrderProcessing />
		</div>
	{:else if ui.checkoutStep === 'success'}
		<div class="cart-drawer">
			<OrderSuccess oncontinue={handleContinueShopping} />
		</div>
	{/if}
</Drawer>

<style>
	.cart-drawer {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	/* --- Header --- */
	.cart-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.cart-header__title {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	:global(.cart-header__icon) {
		width: 20px;
		height: 20px;
		color: var(--md-sys-color-primary);
	}

	.cart-header__text {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.cart-header__close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 9999px;
		transition: background-color 0.15s ease;
	}

	.cart-header__close-btn:hover {
		background: var(--md-sys-color-surface-container);
	}

	:global(.cart-header__close-icon) {
		width: 20px;
		height: 20px;
	}

	/* --- Items --- */
	.cart-items {
		flex: 1;
		overflow-y: auto;
		padding: 8px 12px 0;
	}

	.cart-items__list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	/* --- Empty state --- */
	.cart-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64px 0;
		text-align: center;
	}

	:global(.cart-empty__icon) {
		width: 80px;
		height: 80px;
		color: var(--md-sys-color-outline-variant);
		margin-bottom: 16px;
	}

	.cart-empty__title {
		font-size: 1rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
	}

	.cart-empty__subtitle {
		margin-top: 4px;
		font-size: 0.875rem;
		color: var(--md-sys-color-outline);
	}

	.cart-empty__btn {
		margin-top: 24px;
		padding: 10px 24px;
		border-radius: 9999px;
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* --- Footer --- */
	.cart-footer {
		background: var(--md-sys-color-surface);
		padding-top: 12px;
		padding-bottom: 24px;
	}

	/* --- Totals --- */
	.cart-totals {
		margin: 0 16px;
		padding: 16px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--md-sys-color-surface-container) 90%, transparent);
	}

	.cart-totals__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cart-totals__row + .cart-totals__row {
		margin-top: 6px;
	}

	.cart-totals__label {
		font-size: 0.875rem;
		color: var(--md-sys-color-on-surface-variant);
	}

	.cart-totals__value {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}

	.cart-totals__divider {
		margin: 12px 0;
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.cart-totals__total-label {
		font-size: 1rem;
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
	}

	.cart-totals__total-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--md-sys-color-primary);
	}

	/* --- Action buttons --- */
	.cart-actions {
		display: flex;
		gap: 12px;
		padding: 12px 16px 0;
	}

	.cart-action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		height: 56px;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 500;
		transition: transform 0.1s ease;
	}

	.cart-action-btn:active {
		transform: scale(0.98);
	}

	.cart-action-btn--clear {
		background: var(--md-sys-color-secondary);
		color: var(--md-sys-color-on-secondary);
	}

	.cart-action-btn--checkout {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
	}

	:global(.cart-action-btn__icon) {
		width: 20px;
		height: 20px;
	}

	.cart-action-btn__icon-inline {
		width: 20px;
		height: 20px;
	}
</style>
