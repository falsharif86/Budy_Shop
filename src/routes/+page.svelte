<script lang="ts">
	import ScrollAwareCategoryBar from '$lib/components/category/ScrollAwareCategoryBar.svelte';
	import ProductGrid from '$lib/components/product/ProductGrid.svelte';
	import CheckoutFlow from '$lib/components/checkout/CheckoutFlow.svelte';
	import { productStore } from '$lib/stores/products.svelte.js';

	let { data } = $props();

	let showCheckout = $state(false);
	let scrollY = $state(0);

	// Initialize store with SSR data
	$effect(() => {
		productStore.setProducts(data.products);
		productStore.setCategories(data.categories);
	});

	function handleScroll(e: Event) {
		const target = e.target as HTMLElement;
		scrollY = target.scrollTop;
	}
</script>

{#if showCheckout}
	<CheckoutFlow onback={() => (showCheckout = false)} />
{:else}
	<div
		class="flex h-[calc(100dvh-3.5rem)] flex-col overflow-y-auto pb-24"
		onscroll={handleScroll}
	>
		<!-- Parallax-fading category bar -->
		<ScrollAwareCategoryBar categories={productStore.categories} {scrollY} />

		<!-- Product grid -->
		<ProductGrid products={productStore.products} />
	</div>
{/if}
