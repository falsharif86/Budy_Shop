<script lang="ts">
	import { getProductName, getProductDescription, getProductBrand } from '$lib/utils/eav.js';
	import { getProductImageUrl, getAllProductImages } from '$lib/utils/image-url.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import { isInStock, getEffectivePrice, getEffectiveStock } from '$lib/types/product.js';
	import type { ProductVariant } from '$lib/types/product.js';
	import ProductImage from '$lib/components/shared/ProductImage.svelte';
	import VariantSelector from '$lib/components/product/VariantSelector.svelte';
	import { cart } from '$lib/stores/cart.svelte.js';
	import { goto } from '$app/navigation';

	let { data } = $props();
	const product = $derived(data.product);

	let selectedVariant = $state<ProductVariant | null>(null);
	let quantity = $state(1);

	$effect(() => {
		selectedVariant = product.variants.find((v) => v.isDefault && v.isActive) ?? null;
	});

	const name = $derived(getProductName(product));
	const description = $derived(getProductDescription(product));
	const brand = $derived(getProductBrand(product));
	const images = $derived(getAllProductImages(product));
	const price = $derived(selectedVariant?.price ?? getEffectivePrice(product));
	const inStock = $derived(isInStock(product));
	const stock = $derived(selectedVariant?.stockLevel ?? getEffectiveStock(product));

	function handleAddToCart() {
		if (!inStock) return;
		cart.addItem(product, selectedVariant, quantity);
	}
</script>

<svelte:head>
	<title>{name} | {data.tenant?.name ?? 'Shop'}</title>
	<meta name="description" content={description ?? `Buy ${name} online`} />
	<meta property="og:title" content={name} />
	<meta property="og:description" content={description ?? ''} />
	<meta property="og:image" content={getProductImageUrl(product)} />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<!-- Back -->
	<button
		class="mb-4 flex items-center gap-1 text-sm text-[var(--md-sys-color-primary)]"
		onclick={() => goto('/')}
	>
		<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path d="M15 19l-7-7 7-7" />
		</svg>
		Back to shop
	</button>

	<div class="grid gap-8 md:grid-cols-2">
		<!-- Images -->
		<div class="aspect-square overflow-hidden rounded-[var(--md-sys-shape-corner-xl)] bg-[var(--md-sys-color-surface-container)]">
			<ProductImage src={images[0]} alt={name} class="h-full w-full" />
		</div>

		<!-- Details -->
		<div class="flex flex-col gap-4">
			{#if brand}
				<span class="text-xs font-semibold tracking-wider text-[var(--md-sys-color-primary)] uppercase">{brand}</span>
			{/if}

			<h1 class="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">{name}</h1>

			<div class="flex items-baseline gap-3">
				<span class="text-3xl font-bold text-[var(--md-sys-color-on-surface)]">{formatPrice(price)}</span>
				{#if !inStock}
					<span class="rounded-full bg-[var(--md-sys-color-error-container)] px-3 py-1 text-xs font-medium text-[var(--md-sys-color-error)]">
						Out of Stock
					</span>
				{/if}
			</div>

			<VariantSelector
				variants={product.variants}
				selected={selectedVariant}
				onselect={(v) => { selectedVariant = v; quantity = 1; }}
			/>

			{#if description}
				<p class="text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">{description}</p>
			{/if}

			{#if inStock}
				<div class="mt-4 flex items-center gap-3">
					<div class="flex items-center rounded-full border border-[var(--md-sys-color-outline-variant)]">
						<button
							class="flex h-10 w-10 items-center justify-center"
							onclick={() => { if (quantity > 1) quantity--; }}
							aria-label="Decrease"
						>-</button>
						<span class="w-8 text-center text-sm font-semibold">{quantity}</span>
						<button
							class="flex h-10 w-10 items-center justify-center"
							onclick={() => { if (quantity < stock) quantity++; }}
							aria-label="Increase"
						>+</button>
					</div>

					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--md-sys-color-primary)] py-3 font-medium text-[var(--md-sys-color-on-primary)]"
						onclick={handleAddToCart}
					>
						Add to Cart - {formatPrice(price * quantity)}
					</button>
				</div>
			{/if}

			{#if product.tags.length > 0}
				<div class="mt-2 flex flex-wrap gap-1.5">
					{#each product.tags.slice(0, 8) as tag (tag.id)}
						<span class="rounded-full bg-[var(--md-sys-color-surface-container-high)] px-2.5 py-0.5 text-xs text-[var(--md-sys-color-on-surface-variant)]">
							{tag.tag}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
