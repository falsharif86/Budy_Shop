import type { Product, ProductVariant } from '$lib/types/product.js';
import type { CartItem } from '$lib/types/cart.js';
import { getCartItemId, getCartItemPrice } from '$lib/types/cart.js';

function createCartStore() {
	let items = $state<CartItem[]>([]);
	let lastAction = $state<'add' | 'remove' | null>(null);
	let _tenantId: string | null = null;

	const totalItems = $derived(items.reduce((sum, item) => sum + item.quantity, 0));
	const totalPrice = $derived(items.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0));
	const isEmpty = $derived(items.length === 0);

	function _storageKey(): string | null {
		return _tenantId ? `budy_cart_${_tenantId}` : null;
	}

	function _saveToStorage() {
		if (typeof window === 'undefined') return;
		const key = _storageKey();
		if (!key) return;
		try {
			localStorage.setItem(key, JSON.stringify(items));
		} catch {
			// Storage full or unavailable
		}
	}

	function _loadFromStorage() {
		if (typeof window === 'undefined') return;
		const key = _storageKey();
		if (!key) return;
		try {
			const raw = localStorage.getItem(key);
			if (raw) {
				items = JSON.parse(raw);
			}
		} catch {
			// Corrupted data, start fresh
			items = [];
		}
	}

	function initPersistence(tenantId: string) {
		_tenantId = tenantId;
		_loadFromStorage();
	}

	function addItem(product: Product, variant: ProductVariant | null = null, quantity = 1) {
		const newItem: CartItem = { product, variant, quantity: 0 };
		const itemId = getCartItemId(newItem);
		const existing = items.find((i) => getCartItemId(i) === itemId);

		if (existing) {
			existing.quantity += quantity;
			items = [...items]; // trigger reactivity
		} else {
			items = [...items, { product, variant, quantity }];
		}
		lastAction = 'add';
		_saveToStorage();
	}

	function removeItem(productId: string, variantId: string | null = null) {
		const targetId = variantId ? `${productId}:${variantId}` : productId;
		items = items.filter((i) => getCartItemId(i) !== targetId);
		lastAction = 'remove';
		_saveToStorage();
	}

	function updateQuantity(productId: string, variantId: string | null, quantity: number) {
		const targetId = variantId ? `${productId}:${variantId}` : productId;
		if (quantity <= 0) {
			removeItem(productId, variantId);
			return;
		}
		const item = items.find((i) => getCartItemId(i) === targetId);
		if (item) {
			item.quantity = quantity;
			items = [...items];
		}
		_saveToStorage();
	}

	function clear() {
		items = [];
		lastAction = null;
		_saveToStorage();
	}

	function getItemQuantity(productId: string, variantId: string | null = null): number {
		const targetId = variantId ? `${productId}:${variantId}` : productId;
		const item = items.find((i) => getCartItemId(i) === targetId);
		return item?.quantity ?? 0;
	}

	return {
		get items() {
			return items;
		},
		get totalItems() {
			return totalItems;
		},
		get totalPrice() {
			return totalPrice;
		},
		get isEmpty() {
			return isEmpty;
		},
		get lastAction() {
			return lastAction;
		},
		addItem,
		removeItem,
		updateQuantity,
		getItemQuantity,
		clear,
		initPersistence
	};
}

export const cart = createCartStore();
