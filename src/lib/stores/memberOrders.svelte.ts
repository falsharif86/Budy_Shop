import type {
	MemberOrder,
	MemberOrderDetail,
	MemberOrderListResult
} from '$lib/types/order.js';

export type OrderViewMode = 'list' | 'detail';

const PAGE_SIZE = 10;

function createMemberOrdersStore() {
	let orders = $state<MemberOrder[]>([]);
	let totalCount = $state(0);
	let loading = $state(false);
	let loadingDetail = $state(false);
	let error = $state<string | null>(null);
	let selectedOrder = $state<MemberOrderDetail | null>(null);
	let viewMode = $state<OrderViewMode>('list');

	const hasOrders = $derived(orders.length > 0);
	const hasMore = $derived(orders.length < totalCount);

	async function load() {
		loading = true;
		error = null;
		try {
			const res = await fetch(
				`/api/orders/member?SkipCount=0&MaxResultCount=${PAGE_SIZE}`
			);
			if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
			const data: MemberOrderListResult = await res.json();
			orders = data.items;
			totalCount = data.totalCount;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load orders';
		} finally {
			loading = false;
		}
	}

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;
		error = null;
		try {
			const res = await fetch(
				`/api/orders/member?SkipCount=${orders.length}&MaxResultCount=${PAGE_SIZE}`
			);
			if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
			const data: MemberOrderListResult = await res.json();
			orders = [...orders, ...data.items];
			totalCount = data.totalCount;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load orders';
		} finally {
			loading = false;
		}
	}

	async function selectOrder(id: string) {
		loadingDetail = true;
		error = null;
		viewMode = 'detail';
		try {
			const res = await fetch(`/api/orders/member/${id}`);
			if (!res.ok) throw new Error(`Failed to load order details (${res.status})`);
			selectedOrder = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load order details';
			viewMode = 'list';
		} finally {
			loadingDetail = false;
		}
	}

	function backToList() {
		viewMode = 'list';
		selectedOrder = null;
	}

	function clear() {
		orders = [];
		totalCount = 0;
		loading = false;
		loadingDetail = false;
		error = null;
		selectedOrder = null;
		viewMode = 'list';
	}

	return {
		get orders() {
			return orders;
		},
		get totalCount() {
			return totalCount;
		},
		get loading() {
			return loading;
		},
		get loadingDetail() {
			return loadingDetail;
		},
		get error() {
			return error;
		},
		get selectedOrder() {
			return selectedOrder;
		},
		get viewMode() {
			return viewMode;
		},
		get hasOrders() {
			return hasOrders;
		},
		get hasMore() {
			return hasMore;
		},
		load,
		loadMore,
		selectOrder,
		backToList,
		clear
	};
}

export const memberOrdersStore = createMemberOrdersStore();
