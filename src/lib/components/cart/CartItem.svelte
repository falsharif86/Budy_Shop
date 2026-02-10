<script lang="ts">
	import type { CartItem } from '$lib/types/cart.js';
	import { getCartItemPrice, getCartItemName } from '$lib/types/cart.js';
	import { getProductImageUrl } from '$lib/utils/image-url.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import ProductImage from '$lib/components/shared/ProductImage.svelte';
	import { IconPlus, IconMinus } from '$lib/components/icons/index.js';
	import { cart } from '$lib/stores/cart.svelte.js';

	interface Props {
		item: CartItem;
	}

	let { item }: Props = $props();

	const name = $derived(getCartItemName(item));
	const imageUrl = $derived(getProductImageUrl(item.product));
	const unitPrice = $derived(getCartItemPrice(item));
	const totalPrice = $derived(unitPrice * item.quantity);
	const variantId = $derived(item.variant?.id ?? null);

	function increment() {
		cart.updateQuantity(item.product.id, variantId, item.quantity + 1);
	}

	function decrement() {
		cart.updateQuantity(item.product.id, variantId, item.quantity - 1);
	}
</script>

<div class="cart-item">
	<!-- Top row: image + name/unit price + total price -->
	<div class="cart-item__top">
		<!-- Image -->
		<div class="cart-item__image">
			<ProductImage src={imageUrl} alt={name} class="h-full w-full" />
		</div>

		<!-- Name + unit price -->
		<div class="cart-item__info">
			<h4 class="cart-item__name">{name}</h4>
			<p class="cart-item__unit-price">{formatPrice(unitPrice)}/unit</p>
		</div>

		<!-- Total price -->
		<span class="cart-item__total">{formatPrice(totalPrice)}</span>
	</div>

	<!-- Bottom row: full-width quantity bar -->
	<div class="cart-item__qty-bar">
		<!-- Minus button -->
		<button
			class="cart-item__qty-btn cart-item__qty-btn--minus"
			onclick={decrement}
			aria-label="Decrease quantity"
		>
			<IconMinus class="cart-item__qty-icon" />
		</button>

		<!-- Quantity display -->
		<div class="cart-item__qty-display">
			<span class="cart-item__qty-value">{item.quantity}</span>
		</div>

		<!-- Plus button -->
		<button
			class="cart-item__qty-btn cart-item__qty-btn--plus"
			onclick={increment}
			aria-label="Increase quantity"
		>
			<IconPlus class="cart-item__qty-icon" />
		</button>
	</div>
</div>

<style>
	.cart-item {
		padding: 12px;
		border-radius: 8px;
		background: var(--md-sys-color-surface-container);
	}

	.cart-item__top {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.cart-item__image {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		overflow: hidden;
		border-radius: 6px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.cart-item__info {
		flex: 1;
		min-width: 0;
	}

	.cart-item__name {
		font-size: 15px;
		font-weight: 500;
		line-height: 1.3;
		color: var(--md-sys-color-on-surface);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.cart-item__unit-price {
		margin-top: 2px;
		font-size: 12px;
		color: var(--md-sys-color-on-surface-variant);
	}

	.cart-item__total {
		flex-shrink: 0;
		font-size: 16px;
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
	}

	.cart-item__qty-bar {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 10px;
		padding: 4px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--md-sys-color-surface-container-highest) 50%, transparent);
	}

	.cart-item__qty-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 32px;
		border-radius: 6px;
		transition: background-color 0.15s ease;
	}

	.cart-item__qty-btn:active {
		transform: scale(0.95);
	}

	.cart-item__qty-btn--minus {
		background: color-mix(in srgb, var(--md-sys-color-secondary) 10%, transparent);
	}

	.cart-item__qty-btn--minus:hover {
		background: color-mix(in srgb, var(--md-sys-color-secondary) 20%, transparent);
	}

	.cart-item__qty-btn--plus {
		background: color-mix(in srgb, var(--md-sys-color-primary) 10%, transparent);
	}

	.cart-item__qty-btn--plus:hover {
		background: color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
	}

	:global(.cart-item__qty-icon) {
		width: 16px;
		height: 16px;
	}

	.cart-item__qty-btn--minus :global(.cart-item__qty-icon) {
		color: var(--md-sys-color-secondary);
	}

	.cart-item__qty-btn--plus :global(.cart-item__qty-icon) {
		color: var(--md-sys-color-primary);
	}

	.cart-item__qty-display {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 0;
		border-radius: 6px;
		border: 1px solid color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent);
		background: color-mix(in srgb, var(--md-sys-color-primary-container) 30%, transparent);
	}

	.cart-item__qty-value {
		font-size: 14px;
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
	}
</style>
