<script lang="ts">
	import ScrollAwareCategoryBar from '$lib/components/category/ScrollAwareCategoryBar.svelte';
	import ProductGrid from '$lib/components/product/ProductGrid.svelte';
	import { productStore } from '$lib/stores/products.svelte.js';

	let { data } = $props();

	let scrollY = $state(0);

	// Initialize store for client-side interactivity (filtering, search)
	$effect(() => {
		productStore.setProducts(data.products);
		productStore.setCategories(data.categories);
	});

	// Use store products when available (client-side, supports filtering),
	// fall back to data.products for SSR ($effect doesn't run during SSR,
	// and $derived in module-level stores doesn't recompute during SSR)
	let displayProducts = $derived(
		productStore.allProducts.length > 0 ? productStore.products : data.products
	);
</script>

<svelte:window bind:scrollY={scrollY} />

<div class="flex flex-col pb-24">
	<!-- Parallax-fading category bar -->
	<ScrollAwareCategoryBar categories={productStore.categories.length > 0 ? productStore.categories : data.categories} {scrollY} />

	<!-- Product grid -->
	<ProductGrid products={displayProducts} />
</div>
