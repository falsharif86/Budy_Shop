<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import NavigationDrawer from '$lib/components/layout/NavigationDrawer.svelte';
	import CartFab from '$lib/components/cart/CartFab.svelte';
	import CartDrawer from '$lib/components/cart/CartDrawer.svelte';
	import ProductDetails from '$lib/components/product/ProductDetails.svelte';
	import Drawer from '$lib/components/shared/Drawer.svelte';
	import MyAddressesView from '$lib/components/address/MyAddressesView.svelte';
	import LoginSheet from '$lib/components/auth/LoginSheet.svelte';
	import { ui } from '$lib/stores/ui.svelte.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Auto-open login sheet from ?login query param (e.g. redirect from /auth/login)
	$effect(() => {
		if (page.url.searchParams.has('login')) {
			ui.openLoginSheet();
			goto(page.url.pathname, { replaceState: true });
		}
	});
</script>

<!-- Navigation Drawer (outside shifted container so the fixed pane isn't offset) -->
<NavigationDrawer />

<div class="shell-content">
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

	<!-- Address Drawer -->
	{#if ui.addressDrawerOpen}
		<Drawer open={true} side="right" onclose={() => ui.closeAddressDrawer()}>
			<MyAddressesView />
		</Drawer>
	{/if}

	<!-- Login Sheet -->
	{#if ui.loginSheetOpen}
		<LoginSheet tenantName={page.data.tenant?.name ?? 'Shop'} />
	{/if}
</div>

<style>
	.shell-content {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	@media (min-width: 1024px) {
		.shell-content {
			margin-left: 280px;
		}
	}
</style>
