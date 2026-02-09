<script lang="ts">
	import type { Product } from '$lib/types/product.js';
	import { getProductImageUrl } from '$lib/utils/image-url.js';
	import { formatPriceCompact } from '$lib/utils/currency.js';
	import { isInStock, getEffectivePrice } from '$lib/types/product.js';
	import ProductImage from '$lib/components/shared/ProductImage.svelte';
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

	function handleClick() {
		ui.openProductDrawer(product);
	}

	function handleAddToCart(e: MouseEvent) {
		e.stopPropagation();
		if (!inStock) return;
		const defaultVariant = product.variants.find((v) => v.isDefault && v.isActive) ?? null;
		cart.addItem(product, defaultVariant);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative flex cursor-pointer flex-col items-center text-left"
	style="animation: stagger-in 275ms {index * 50}ms both ease-out;"
	onclick={handleClick}
	onkeydown={(e) => { if (e.key === 'Enter') handleClick(); }}
	role="button"
	tabindex="0"
	aria-label="View {name}"
>
	<!-- Card body -->
	<div
		class="relative w-full overflow-hidden rounded-[var(--md-sys-shape-corner-large)] bg-[var(--md-sys-color-surface-container)] transition-shadow duration-200 group-hover:shadow-[var(--md-sys-elevation-2)]"
		style="box-shadow: var(--md-sys-elevation-1);"
	>
		<!-- Image area with floating overlap -->
		<div class="relative mx-auto -mt-0 px-3 pt-3">
			<div class="relative aspect-square overflow-hidden rounded-[var(--md-sys-shape-corner-medium)]">
				<ProductImage src={imageUrl} alt={name} class="h-full w-full" />

				{#if !inStock}
					<div class="absolute inset-0 flex items-center justify-center bg-black/40">
						<span class="rounded-full bg-[var(--md-sys-color-error)] px-3 py-1 text-xs font-semibold text-[var(--md-sys-color-on-error)]">
							Out of Stock
						</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Content -->
		<div class="flex flex-col gap-1 p-3 pt-2">
			{#if product.categoryName}
				<span class="text-[11px] font-medium tracking-wide text-[var(--md-sys-color-primary)] uppercase">
					{product.categoryName}
				</span>
			{/if}

			<h3 class="line-clamp-2 text-sm font-medium leading-tight text-[var(--md-sys-color-on-surface)]">
				{name}
			</h3>

			<div class="mt-1 flex items-center justify-between">
				<span class="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
					{formatPriceCompact(price)}
				</span>

				{#if inStock}
					<button
						class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] transition-transform active:scale-90"
						onclick={handleAddToCart}
						aria-label="Add {name} to cart"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path d="M12 5v14m-7-7h14" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
