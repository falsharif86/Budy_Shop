<script lang="ts">
	import type { Product } from '$lib/types/product.js';
	import { getProductImageUrl } from '$lib/utils/image-url.js';
	import { formatPriceCompact } from '$lib/utils/currency.js';
	import { isInStock, getEffectivePrice } from '$lib/types/product.js';
	import ProductImage from '$lib/components/shared/ProductImage.svelte';
	import { IconPlus, IconMinus } from '$lib/components/icons/index.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import { cart } from '$lib/stores/cart.svelte.js';

	interface Props {
		product: Product;
		index?: number;
	}

	let { product, index = 0 }: Props = $props();

	const name = $derived(product.name);
	const imageUrl = $derived(getProductImageUrl(product));
	const price = $derived(getEffectivePrice(product));
	const inStock = $derived(isInStock(product));
	const defaultVariant = $derived(product.variants.find((v) => v.isDefault && v.isActive) ?? null);
	const variantId = $derived(defaultVariant?.id ?? null);
	const cartQuantity = $derived(cart.getItemQuantity(product.id, variantId));

	function handleClick() {
		ui.openProductDrawer(product);
	}

	function handleAddToCart(e: MouseEvent) {
		e.stopPropagation();
		if (!inStock) return;
		cart.addItem(product, defaultVariant);
	}

	function handleIncrement(e: MouseEvent) {
		e.stopPropagation();
		cart.updateQuantity(product.id, variantId, cartQuantity + 1);
	}

	function handleDecrement(e: MouseEvent) {
		e.stopPropagation();
		cart.updateQuantity(product.id, variantId, cartQuantity - 1);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="product-card group relative cursor-pointer"
	style="animation: stagger-in 275ms {index * 50}ms both ease-out;"
	onclick={handleClick}
	onkeydown={(e) => { if (e.key === 'Enter') handleClick(); }}
	role="button"
	tabindex="0"
	aria-label="View {name}"
>
	<!-- Overflow product image -->
	<div class="product-card__image">
		<ProductImage src={imageUrl} alt={name} class="h-full w-full" />
	</div>

	<!-- Card body -->
	<div class="product-card__body">
		{#if !inStock}
			<div class="product-card__out-of-stock">
				<span>Out of Stock</span>
			</div>
		{/if}

		<!-- Content area below image -->
		<div class="product-card__content">
			<!-- Subcategory label with border -->
			{#if product.categoryName}
				<span class="product-card__category">
					{product.categoryName}
				</span>
			{/if}

			<!-- Product name -->
			<h3 class="product-card__name">
				{name}
			</h3>

			<!-- Price -->
			<span class="product-card__price">
				{formatPriceCompact(price)}
			</span>

			<!-- Add / Quantity control -->
			{#if inStock}
				{#if cartQuantity > 0}
					<div class="product-card__qty-bar">
						<button
							class="product-card__qty-btn product-card__qty-btn--minus"
							onclick={handleDecrement}
							aria-label="Decrease quantity of {name}"
						>
							<IconMinus class="product-card__qty-icon" />
						</button>
						<span class="product-card__qty-value">{cartQuantity}</span>
						<button
							class="product-card__qty-btn product-card__qty-btn--plus"
							onclick={handleIncrement}
							aria-label="Increase quantity of {name}"
						>
							<IconPlus class="product-card__qty-icon" />
						</button>
					</div>
				{:else}
					<button
						class="product-card__add-btn"
						onclick={handleAddToCart}
						aria-label="Add {name} to cart"
					>
						Add
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.product-card {
		position: relative;
		width: 140px;
		height: 250px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Overflow image that sticks out above the card */
	.product-card__image {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100px;
		height: 120px;
		z-index: 2;
		filter: drop-shadow(3.5px 3.5px 4.9px rgba(0, 0, 0, 0.7));
		border-radius: 12px;
		overflow: hidden;
	}

	/* Card body sits below, image overflows above it */
	.product-card__body {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 200px;
		background: var(--md-sys-color-surface-container);
		border-radius: 31.5px;
		overflow: hidden;
		transition: box-shadow 0.2s ease;
	}

	.product-card:hover .product-card__body {
		box-shadow: 0 0 20px rgba(0, 200, 150, 0.1);
	}

	.product-card__out-of-stock {
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 3;
	}

	.product-card__out-of-stock span {
		display: inline-block;
		background: var(--md-sys-color-error);
		color: var(--md-sys-color-on-error);
		font-size: 9px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 999px;
	}

	/* Content area positioned below the overflow image */
	.product-card__content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 72px 10px 12px;
		height: 100%;
	}

	.product-card__category {
		display: inline-flex;
		padding: 2px 10px;
		border-radius: 12px;
		border: 1px solid color-mix(in srgb, var(--md-sys-color-primary) 50%, transparent);
		background: transparent;
		font-size: 9px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--md-sys-color-primary);
		line-height: 1.4;
	}

	.product-card__name {
		width: 100%;
		text-align: center;
		font-size: 12px;
		font-weight: 500;
		line-height: 1.3;
		color: var(--md-sys-color-on-surface);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.product-card__price {
		font-size: 15px;
		font-weight: 700;
		color: var(--md-sys-color-primary);
	}

	.product-card__add-btn {
		margin-top: auto;
		width: 120px;
		height: 36px;
		border: 1.5px solid var(--md-sys-color-primary);
		border-radius: 20px;
		background: transparent;
		color: var(--md-sys-color-primary);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.product-card__add-btn:hover {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
	}

	.product-card__add-btn:active {
		transform: scale(0.95);
	}

	/* Quantity bar (replaces Add button when item is in cart) */
	.product-card__qty-bar {
		margin-top: auto;
		width: 120px;
		height: 36px;
		display: flex;
		align-items: center;
		border-radius: 20px;
		background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
		overflow: hidden;
	}

	.product-card__qty-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		border-radius: 50%;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.product-card__qty-btn:active {
		transform: scale(0.9);
	}

	.product-card__qty-btn--minus {
		background: transparent;
	}

	.product-card__qty-btn--minus:hover {
		background: color-mix(in srgb, var(--md-sys-color-error) 15%, transparent);
	}

	.product-card__qty-btn--plus {
		background: var(--md-sys-color-primary);
	}

	.product-card__qty-btn--plus:hover {
		background: color-mix(in srgb, var(--md-sys-color-primary) 85%, black);
	}

	:global(.product-card__qty-icon) {
		width: 14px;
		height: 14px;
	}

	.product-card__qty-btn--minus :global(.product-card__qty-icon) {
		color: var(--md-sys-color-on-surface);
	}

	.product-card__qty-btn--plus :global(.product-card__qty-icon) {
		color: var(--md-sys-color-on-primary);
	}

	.product-card__qty-value {
		flex: 1;
		text-align: center;
		font-size: 14px;
		font-weight: 700;
		color: var(--md-sys-color-primary);
		user-select: none;
	}
</style>
