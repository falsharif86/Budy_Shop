import type { Product } from '$lib/types/product.js';

export type CheckoutStep = 'cart' | 'checkout' | 'processing' | 'success';
export type DeliveryOption = 'pickup' | 'delivery';

function createUiStore() {
	let cartDrawerOpen = $state(false);
	let productDrawerOpen = $state(false);
	let selectedProduct = $state<Product | null>(null);
	let searchQuery = $state('');
	let searchFocused = $state(false);
	let navDrawerOpen = $state(false);
	let searchExpanded = $state(false);
	let checkoutStep = $state<CheckoutStep>('cart');
	let selectedDeliveryOption = $state<DeliveryOption | null>(null);

	function openCartDrawer() {
		cartDrawerOpen = true;
	}

	function closeCartDrawer() {
		cartDrawerOpen = false;
		// Delay resetting checkout state to allow exit animation
		setTimeout(() => {
			if (!cartDrawerOpen) {
				checkoutStep = 'cart';
				selectedDeliveryOption = null;
			}
		}, 350);
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

	function startCheckout() {
		checkoutStep = 'checkout';
	}

	function backToCart() {
		checkoutStep = 'cart';
		selectedDeliveryOption = null;
	}

	function setDeliveryOption(option: DeliveryOption) {
		selectedDeliveryOption = option;
	}

	function startProcessing() {
		checkoutStep = 'processing';
	}

	function showSuccess() {
		checkoutStep = 'success';
	}

	function resetCheckout() {
		checkoutStep = 'cart';
		selectedDeliveryOption = null;
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
		get checkoutStep() {
			return checkoutStep;
		},
		get selectedDeliveryOption() {
			return selectedDeliveryOption;
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
		collapseSearch,
		startCheckout,
		backToCart,
		setDeliveryOption,
		startProcessing,
		showSuccess,
		resetCheckout
	};
}

export const ui = createUiStore();
