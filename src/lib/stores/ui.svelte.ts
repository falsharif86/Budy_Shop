import type { Product } from '$lib/types/product.js';

function createUiStore() {
	let cartDrawerOpen = $state(false);
	let productDrawerOpen = $state(false);
	let selectedProduct = $state<Product | null>(null);
	let searchQuery = $state('');
	let searchFocused = $state(false);
	let navDrawerOpen = $state(false);
	let searchExpanded = $state(false);

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

	function openNavDrawer() {
		navDrawerOpen = true;
	}

	function closeNavDrawer() {
		navDrawerOpen = false;
	}

	function toggleNavDrawer() {
		navDrawerOpen = !navDrawerOpen;
	}

	function toggleSearch() {
		searchExpanded = !searchExpanded;
	}

	function collapseSearch() {
		searchExpanded = false;
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
		get navDrawerOpen() {
			return navDrawerOpen;
		},
		get searchExpanded() {
			return searchExpanded;
		},
		openCartDrawer,
		closeCartDrawer,
		toggleCartDrawer,
		openProductDrawer,
		closeProductDrawer,
		setSearchQuery,
		openNavDrawer,
		closeNavDrawer,
		toggleNavDrawer,
		toggleSearch,
		collapseSearch
	};
}

export const ui = createUiStore();
