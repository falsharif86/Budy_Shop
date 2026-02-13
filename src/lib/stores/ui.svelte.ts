import type { Product } from '$lib/types/product.js';

export type CheckoutStep = 'cart' | 'checkout' | 'processing' | 'success';
export type DeliveryOption = 'pickup' | 'delivery';
export type AddressFormMode = 'list' | 'create' | 'edit';

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
	let addressDrawerOpen = $state(false);
	let addressFormMode = $state<AddressFormMode>('list');
	let editingAddressId = $state<string | null>(null);
	let loginSheetOpen = $state(false);

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

	function openAddressDrawer() {
		addressDrawerOpen = true;
		addressFormMode = 'list';
		editingAddressId = null;
	}

	function closeAddressDrawer() {
		addressDrawerOpen = false;
		setTimeout(() => {
			if (!addressDrawerOpen) {
				addressFormMode = 'list';
				editingAddressId = null;
			}
		}, 350);
	}

	function showAddressForm(mode: 'create' | 'edit', id?: string) {
		addressFormMode = mode;
		editingAddressId = mode === 'edit' ? (id ?? null) : null;
	}

	function showAddressList() {
		addressFormMode = 'list';
		editingAddressId = null;
	}

	function openLoginSheet() {
		loginSheetOpen = true;
	}

	function closeLoginSheet() {
		loginSheetOpen = false;
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
		get addressDrawerOpen() {
			return addressDrawerOpen;
		},
		get addressFormMode() {
			return addressFormMode;
		},
		get editingAddressId() {
			return editingAddressId;
		},
		get loginSheetOpen() {
			return loginSheetOpen;
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
		resetCheckout,
		openAddressDrawer,
		closeAddressDrawer,
		showAddressForm,
		showAddressList,
		openLoginSheet,
		closeLoginSheet
	};
}

export const ui = createUiStore();
