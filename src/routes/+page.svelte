<script lang="ts">
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import CategoryBar from '$lib/components/category/CategoryBar.svelte';
	import ProductGrid from '$lib/components/product/ProductGrid.svelte';
	import CheckoutFlow from '$lib/components/checkout/CheckoutFlow.svelte';
	import { productStore } from '$lib/stores/products.svelte.js';

	let { data } = $props();

	let showCheckout = $state(false);

	// Initialize store with SSR data
	$effect(() => {
		productStore.setProducts(data.products);
		productStore.setCategories(data.categories);
	});
</script>

{#if showCheckout}
	<CheckoutFlow onback={() => (showCheckout = false)} />
{:else}
	<div class="flex flex-col gap-2 pb-24 pt-2">
		<SearchBar />
		<CategoryBar categories={productStore.categories} />
		<ProductGrid products={productStore.products} />
	</div>
{/if}
