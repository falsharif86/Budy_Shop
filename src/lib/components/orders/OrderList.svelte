<script lang="ts">
	import { memberOrdersStore } from '$lib/stores/memberOrders.svelte.js';
	import OrderCard from './OrderCard.svelte';

	const activeOrders = $derived(memberOrdersStore.orders.filter((o) => o.statusValue === 0));
	const pastOrders = $derived(memberOrdersStore.orders.filter((o) => o.statusValue !== 0));
</script>

<div class="order-list">
	{#if memberOrdersStore.loading && memberOrdersStore.orders.length === 0}
		<div class="order-list__loading">
			<div class="order-list__spinner"></div>
			<span class="order-list__loading-text">Loading orders...</span>
		</div>
	{:else if !memberOrdersStore.hasOrders}
		<div class="order-list__empty">
			<svg class="order-list__empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
				<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
			<p class="order-list__empty-title">No orders yet</p>
			<p class="order-list__empty-text">Your order history will appear here.</p>
		</div>
	{:else}
		{#if activeOrders.length > 0}
			<div class="order-list__section">
				<h3 class="order-list__section-title">Active</h3>
				<div class="order-list__items">
					{#each activeOrders as order (order.id)}
						<OrderCard {order} onclick={() => memberOrdersStore.selectOrder(order.id)} />
					{/each}
				</div>
			</div>
		{/if}

		{#if pastOrders.length > 0}
			<div class="order-list__section">
				<h3 class="order-list__section-title">Past Orders</h3>
				<div class="order-list__items">
					{#each pastOrders as order (order.id)}
						<OrderCard {order} onclick={() => memberOrdersStore.selectOrder(order.id)} />
					{/each}
				</div>
			</div>
		{/if}

		{#if memberOrdersStore.hasMore}
			<button
				class="order-list__load-more"
				onclick={() => memberOrdersStore.loadMore()}
				disabled={memberOrdersStore.loading}
			>
				{#if memberOrdersStore.loading}
					Loading...
				{:else}
					Load more
				{/if}
			</button>
		{/if}
	{/if}

	{#if memberOrdersStore.error}
		<p class="order-list__error">{memberOrdersStore.error}</p>
	{/if}
</div>

<style>
	.order-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.order-list__section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.order-list__section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--md-sys-color-outline);
		padding-left: 2px;
	}

	.order-list__items {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	/* Loading */
	.order-list__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 32px 0;
	}

	.order-list__spinner {
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

	.order-list__loading-text {
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}

	/* Empty */
	.order-list__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 32px 0;
		text-align: center;
	}

	.order-list__empty-icon {
		width: 48px;
		height: 48px;
		color: var(--md-sys-color-outline-variant);
		margin-bottom: 4px;
	}

	.order-list__empty-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.order-list__empty-text {
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}

	/* Error */
	.order-list__error {
		padding: 10px 14px;
		border-radius: 10px;
		background: var(--md-sys-color-error-container);
		color: var(--md-sys-color-on-error-container);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	/* Load more */
	.order-list__load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 10px;
		border-radius: 12px;
		border: 1.5px dashed var(--md-sys-color-outline-variant);
		background: transparent;
		color: var(--md-sys-color-primary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 150ms ease, border-color 150ms ease;
	}

	.order-list__load-more:hover:not(:disabled) {
		background: color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent);
		border-color: var(--md-sys-color-primary);
	}

	.order-list__load-more:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
