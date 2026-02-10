<script lang="ts">
	import type { Product } from '$lib/types/product.js';
	import ProductCard from './ProductCard.svelte';

	interface Props {
		products: Product[];
	}

	let { products }: Props = $props();
</script>

{#if products.length === 0}
	<div class="flex flex-col items-center justify-center py-20 text-center">
		<svg class="mb-4 h-16 w-16 text-[var(--md-sys-color-outline)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
			<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
		</svg>
		<p class="text-lg font-medium text-[var(--md-sys-color-on-surface-variant)]">No products found</p>
		<p class="mt-1 text-sm text-[var(--md-sys-color-outline)]">Try adjusting your search or filters</p>
	</div>
{:else}
	<div
		class="product-grid grid justify-items-center gap-3 px-4 pt-14"
		style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));"
	>
		{#each products as product, i (product.id)}
			<ProductCard {product} index={i} />
		{/each}
	</div>
{/if}

<style>
	@media (min-width: 1024px) {
		.product-grid {
			padding-left: 1rem;
			padding-right: 1rem;
		}
	}
</style>
