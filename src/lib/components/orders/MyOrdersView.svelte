<script lang="ts">
	import { ui } from '$lib/stores/ui.svelte.js';
	import { memberOrdersStore } from '$lib/stores/memberOrders.svelte.js';
	import { IconClose } from '$lib/components/icons/index.js';
	import OrderList from './OrderList.svelte';
	import OrderDetail from './OrderDetail.svelte';
</script>

<div class="my-orders">
	{#if memberOrdersStore.viewMode === 'list'}
		<div class="my-orders__header">
			<h2 class="my-orders__title">My Orders</h2>
			<button class="my-orders__close" onclick={() => ui.closeOrdersDrawer()} aria-label="Close">
				<IconClose class="my-orders__close-icon" />
			</button>
		</div>
		<div class="my-orders__content">
			<OrderList />
		</div>
	{:else if memberOrdersStore.loadingDetail}
		<div class="my-orders__header">
			<h2 class="my-orders__title">My Orders</h2>
			<button class="my-orders__close" onclick={() => ui.closeOrdersDrawer()} aria-label="Close">
				<IconClose class="my-orders__close-icon" />
			</button>
		</div>
		<div class="my-orders__loading">
			<div class="my-orders__spinner"></div>
			<span class="my-orders__loading-text">Loading order details...</span>
		</div>
	{:else if memberOrdersStore.selectedOrder}
		<OrderDetail
			order={memberOrdersStore.selectedOrder}
			onback={() => memberOrdersStore.backToList()}
		/>
	{/if}
</div>

<style>
	.my-orders {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.my-orders__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.my-orders__title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.my-orders__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 9999px;
		transition: background-color 0.15s ease;
	}

	.my-orders__close:hover {
		background: var(--md-sys-color-surface-container);
	}

	:global(.my-orders__close-icon) {
		width: 20px;
		height: 20px;
	}

	.my-orders__content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.my-orders__loading {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}

	.my-orders__spinner {
		width: 28px;
		height: 28px;
		border: 3px solid var(--md-sys-color-outline-variant);
		border-top-color: var(--md-sys-color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.my-orders__loading-text {
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}
</style>
