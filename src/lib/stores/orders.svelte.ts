import type { OnlineOrderDetail, OrderHistoryEntry } from '$lib/types/order.js';

const MAX_HISTORY = 50;

function createOrderStore() {
	let history = $state<OrderHistoryEntry[]>([]);
	let lastPlacedOrder = $state<OnlineOrderDetail | null>(null);
	let _tenantId: string | null = null;

	function _storageKey(): string | null {
		return _tenantId ? `budy_orders_${_tenantId}` : null;
	}

	function _saveToStorage() {
		if (typeof window === 'undefined') return;
		const key = _storageKey();
		if (!key) return;
		try {
			localStorage.setItem(key, JSON.stringify(history));
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
				history = JSON.parse(raw);
			}
		} catch {
			// Corrupted data, start fresh
			history = [];
		}
	}

	function initPersistence(tenantId: string) {
		_tenantId = tenantId;
		_loadFromStorage();
	}

	function addOrder(detail: OnlineOrderDetail) {
		lastPlacedOrder = detail;

		const entry: OrderHistoryEntry = {
			id: detail.id,
			orderNo: detail.orderNo,
			total: detail.total,
			itemCount: detail.items.length,
			creationTime: detail.creationTime
		};

		history = [entry, ...history].slice(0, MAX_HISTORY);
		_saveToStorage();
	}

	return {
		get history() {
			return history;
		},
		get lastPlacedOrder() {
			return lastPlacedOrder;
		},
		initPersistence,
		addOrder
	};
}

export const orderStore = createOrderStore();
