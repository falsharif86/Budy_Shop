<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import NavigationDrawer from '$lib/components/layout/NavigationDrawer.svelte';
	import CartFab from '$lib/components/cart/CartFab.svelte';
	import CartDrawer from '$lib/components/cart/CartDrawer.svelte';
	import ProductDetails from '$lib/components/product/ProductDetails.svelte';
	import { ui } from '$lib/stores/ui.svelte.js';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="flex min-h-dvh flex-col">
	<Header />

	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Cart FAB -->
	<CartFab />

	<!-- Cart Drawer -->
	<CartDrawer />

	<!-- Product Details Drawer -->
	{#if ui.selectedProduct}
		<ProductDetails product={ui.selectedProduct} />
	{/if}

	<!-- Navigation Drawer -->
	<NavigationDrawer />
</div>
