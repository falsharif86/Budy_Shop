<script lang="ts">
	import type { Product, ProductVariant } from '$lib/types/product.js';
	import { getProductImageUrl } from '$lib/utils/image-url.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import { isInStock, getEffectivePrice, getEffectiveStock } from '$lib/types/product.js';
	import ProductImage from '$lib/components/shared/ProductImage.svelte';
	import VariantSelector from './VariantSelector.svelte';
	import Drawer from '$lib/components/shared/Drawer.svelte';
	import { ui } from '$lib/stores/ui.svelte.js';
	import { cart } from '$lib/stores/cart.svelte.js';
	import { IconClose, IconMinus, IconPlus, IconCart } from '$lib/components/icons/index.js';

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();

	let selectedVariant = $state<ProductVariant | null>(null);
	let quantity = $state(1);

	$effect(() => {
		selectedVariant = product.variants.find((v) => v.isDefault && v.isActive) ?? null;
	});

	const name = $derived(product.name);
	const imageUrl = $derived(getProductImageUrl(product));
	const price = $derived(selectedVariant?.price ?? getEffectivePrice(product));
	const inStock = $derived(isInStock(product));
	const stock = $derived(selectedVariant?.stockLevel ?? getEffectiveStock(product));

	function handleSelectVariant(v: ProductVariant) {
		selectedVariant = v;
		quantity = 1;
	}

	function handleAddToCart() {
		if (!inStock) return;
		cart.addItem(product, selectedVariant, quantity);
		ui.closeProductDrawer();
		ui.openCartDrawer();
	}

	function increment() {
		if (quantity < stock) quantity++;
	}

	function decrement() {
		if (quantity > 1) quantity--;
	}
</script>

<Drawer open={ui.productDrawerOpen} onclose={() => ui.closeProductDrawer()} zIndex={50}>
	<div class="detail-scroll">
		<!-- Image header -->
		<div class="detail-image">
			<ProductImage src={imageUrl} alt={name} class="h-full w-full" />

			<!-- Close button -->
			<button
				class="detail-close-btn"
				onclick={() => ui.closeProductDrawer()}
				aria-label="Close"
			>
				<IconClose class="detail-close-icon" />
			</button>
		</div>

		<!-- Content -->
		<div class="detail-content">
			<h2 class="detail-name">{name}</h2>

			<div class="detail-price-row">
				<span class="detail-price">{formatPrice(price)}</span>
				{#if !inStock}
					<span class="detail-badge detail-badge--error">Out of Stock</span>
				{:else if stock <= 10}
					<span class="detail-low-stock">Only {stock} left</span>
				{/if}
			</div>

			<VariantSelector
				variants={product.variants}
				selected={selectedVariant}
				onselect={handleSelectVariant}
			/>

			<div class="flex-1"></div>
		</div>

		<!-- Bottom action bar -->
		{#if inStock}
			<div class="detail-action-bar">
				<!-- Quantity selector -->
				<div class="detail-qty">
					<button
						class="detail-qty__btn detail-qty__btn--left"
						onclick={decrement}
						disabled={quantity <= 1}
						aria-label="Decrease quantity"
					>
						<IconMinus class="detail-qty__icon" strokeWidth={2.5} />
					</button>
					<span class="detail-qty__value">{quantity}</span>
					<button
						class="detail-qty__btn detail-qty__btn--right"
						onclick={increment}
						disabled={quantity >= stock}
						aria-label="Increase quantity"
					>
						<IconPlus class="detail-qty__icon" strokeWidth={2.5} />
					</button>
				</div>

				<!-- Add to cart button -->
				<button class="detail-add-btn" onclick={handleAddToCart}>
					<IconCart class="detail-add-btn__icon" />
					Add to Cart - {formatPrice(price * quantity)}
				</button>
			</div>
		{/if}
	</div>
</Drawer>

<style>
	.detail-scroll {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
	}

	/* --- Image --- */
	.detail-image {
		position: relative;
		height: 288px;
		flex-shrink: 0;
		background: var(--md-sys-color-surface-container);
	}

	.detail-close-btn {
		position: absolute;
		left: 12px;
		top: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 9999px;
		background: color-mix(in srgb, var(--md-sys-color-surface) 80%, transparent);
		backdrop-filter: blur(8px);
	}

	:global(.detail-close-icon) {
		width: 20px;
		height: 20px;
	}

	/* --- Content --- */
	.detail-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 16px;
		padding: 20px;
	}

	.detail-name {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.3;
		color: var(--md-sys-color-on-surface);
	}

	.detail-price-row {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.detail-price {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
	}

	.detail-badge {
		padding: 2px 8px;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.detail-badge--error {
		background: var(--md-sys-color-error-container);
		color: var(--md-sys-color-error);
	}

	.detail-low-stock {
		font-size: 0.875rem;
		color: var(--md-sys-color-error);
	}

	/* --- Action bar --- */
	.detail-action-bar {
		position: sticky;
		bottom: 0;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
		background: var(--md-sys-color-surface);
	}

	/* --- Quantity selector --- */
	.detail-qty {
		display: flex;
		align-items: center;
		border-radius: 9999px;
		border: 1px solid var(--md-sys-color-outline-variant);
	}

	.detail-qty__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		color: var(--md-sys-color-on-surface);
		transition: background-color 0.15s ease;
	}

	.detail-qty__btn:hover:not(:disabled) {
		background: var(--md-sys-color-surface-container);
	}

	.detail-qty__btn--left {
		border-top-left-radius: 9999px;
		border-bottom-left-radius: 9999px;
	}

	.detail-qty__btn--right {
		border-top-right-radius: 9999px;
		border-bottom-right-radius: 9999px;
	}

	:global(.detail-qty__icon) {
		width: 16px;
		height: 16px;
	}

	.detail-qty__value {
		width: 32px;
		text-align: center;
		font-size: 0.875rem;
		font-weight: 600;
	}

	/* --- Add to cart button --- */
	.detail-add-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 24px;
		border-radius: 9999px;
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		font-weight: 500;
		transition: transform 0.1s ease;
	}

	.detail-add-btn:active {
		transform: scale(0.97);
	}

	:global(.detail-add-btn__icon) {
		width: 20px;
		height: 20px;
	}
</style>
