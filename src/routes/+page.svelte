<script lang="ts">
	import SearchBar from '$lib/components/search/SearchBar.svelte';
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
		class="flex h-dvh flex-col overflow-y-auto pb-24"
		onscroll={handleScroll}
	>
		<!-- Sticky search bar -->
		<div class="sticky top-0 z-10 pb-2 pt-3" style="background: linear-gradient(to bottom, var(--md-sys-color-surface) 60%, transparent);">
			<SearchBar />
		</div>

		<!-- Parallax-fading category bar -->
		<ScrollAwareCategoryBar categories={productStore.categories} {scrollY} />

		<!-- Product grid -->
		<ProductGrid products={productStore.products} />
	</div>
{/if}
