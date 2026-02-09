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
	<div class="flex h-full flex-col overflow-y-auto">
		<!-- Image header -->
		<div class="relative h-72 shrink-0 bg-[var(--md-sys-color-surface-container)]">
			<ProductImage src={imageUrl} alt={name} class="h-full w-full" />

			<!-- Close button -->
			<button
				class="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--md-sys-color-surface)]/80 backdrop-blur-sm"
				onclick={() => ui.closeProductDrawer()}
				aria-label="Close"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="flex flex-1 flex-col gap-4 p-5">
			<!-- Name -->
			<h2 class="text-xl font-semibold leading-tight text-[var(--md-sys-color-on-surface)]">
				{name}
			</h2>

			<!-- Price -->
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
					{formatPrice(price)}
				</span>
				{#if !inStock}
					<span class="rounded-full bg-[var(--md-sys-color-error-container)] px-2 py-0.5 text-xs font-medium text-[var(--md-sys-color-error)]">
						Out of Stock
					</span>
				{:else if stock <= 10}
					<span class="text-sm text-[var(--md-sys-color-error)]">
						Only {stock} left
					</span>
				{/if}
			</div>

			<!-- Variants -->
			<VariantSelector
				variants={product.variants}
				selected={selectedVariant}
				onselect={handleSelectVariant}
			/>

			<!-- Spacer -->
			<div class="flex-1"></div>
		</div>

		<!-- Bottom action bar -->
		{#if inStock}
			<div class="sticky bottom-0 flex items-center gap-3 border-t border-[var(--md-sys-color-outline-variant)]/30 bg-[var(--md-sys-color-surface)] p-4">
				<!-- Quantity selector -->
				<div class="flex items-center rounded-full border border-[var(--md-sys-color-outline-variant)]">
					<button
						class="flex h-10 w-10 items-center justify-center rounded-l-full text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-surface-container)]"
						onclick={decrement}
						disabled={quantity <= 1}
						aria-label="Decrease quantity"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path d="M5 12h14" />
						</svg>
					</button>
					<span class="w-8 text-center text-sm font-semibold">{quantity}</span>
					<button
						class="flex h-10 w-10 items-center justify-center rounded-r-full text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-surface-container)]"
						onclick={increment}
						disabled={quantity >= stock}
						aria-label="Increase quantity"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path d="M12 5v14m-7-7h14" />
						</svg>
					</button>
				</div>

				<!-- Add to cart button -->
				<button
					class="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--md-sys-color-primary)] px-6 py-3 font-medium text-[var(--md-sys-color-on-primary)] transition-transform active:scale-[0.97]"
					onclick={handleAddToCart}
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
					</svg>
					Add to Cart - {formatPrice(price * quantity)}
				</button>
			</div>
		{/if}
	</div>
</Drawer>
