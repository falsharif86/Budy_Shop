import type { Product } from '$lib/types/product.js';

function createUiStore() {
	let cartDrawerOpen = $state(false);
	let productDrawerOpen = $state(false);
	let selectedProduct = $state<Product | null>(null);
	let searchQuery = $state('');
	let searchFocused = $state(false);

	function openCartDrawer() {
		cartDrawerOpen = true;
	}

	function closeCartDrawer() {
		cartDrawerOpen = false;
	}

	function toggleCartDrawer() {
		cartDrawerOpen = !cartDrawerOpen;
	}

	function openProductDrawer(product: Product) {
		selectedProduct = product;
		productDrawerOpen = true;
	}

	function closeProductDrawer() {
		productDrawerOpen = false;
		// Delay clearing product to allow exit animation
		setTimeout(() => {
			if (!productDrawerOpen) selectedProduct = null;
		}, 350);
	}

	function setSearchQuery(q: string) {
		searchQuery = q;
	}

	return {
		get cartDrawerOpen() {
			return cartDrawerOpen;
		},
		get productDrawerOpen() {
			return productDrawerOpen;
		},
		get selectedProduct() {
			return selectedProduct;
		},
		get searchQuery() {
			return searchQuery;
		},
		get searchFocused() {
			return searchFocused;
		},
		set searchFocused(v: boolean) {
			searchFocused = v;
		},
		openCartDrawer,
		closeCartDrawer,
		toggleCartDrawer,
		openProductDrawer,
		closeProductDrawer,
		setSearchQuery
	};
}

export const ui = createUiStore();
