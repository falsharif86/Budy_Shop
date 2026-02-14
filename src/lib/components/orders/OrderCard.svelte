<script lang="ts">
	import type { MemberOrder } from '$lib/types/order.js';
	import { IconStore, IconDelivery } from '$lib/components/icons/index.js';
	import { formatPriceCompact } from '$lib/utils/currency.js';
	import OrderStatusBadge from './OrderStatusBadge.svelte';

	interface Props {
		order: MemberOrder;
		onclick?: () => void;
	}

	let { order, onclick }: Props = $props();

	const isActive = $derived(order.statusValue === 0);
	const isPickup = $derived(order.fulfillmentTypeValue === 0);
	const timeAgo = $derived(formatRelativeTime(order.creationTime));

	function formatRelativeTime(isoDate: string): string {
		const now = Date.now();
		const then = new Date(isoDate).getTime();
		const diffMs = now - then;
		const diffMin = Math.floor(diffMs / 60_000);

		if (diffMin < 1) return 'Just now';
		if (diffMin < 60) return `${diffMin}m ago`;

		const diffHr = Math.floor(diffMin / 60);
		if (diffHr < 24) return `${diffHr}h ago`;

		const diffDays = Math.floor(diffHr / 24);
		if (diffDays < 30) return `${diffDays}d ago`;

		const diffMonths = Math.floor(diffDays / 30);
		if (diffMonths < 12) return `${diffMonths}mo ago`;

		return `${Math.floor(diffMonths / 12)}y ago`;
	}
</script>

<button
	class="order-card"
	class:order-card--active={isActive}
	onclick={onclick}
	type="button"
>
	<div class="order-card__top">
		<div class="order-card__title-row">
			<span class="order-card__order-no">#{order.orderNo ?? '---'}</span>
			<OrderStatusBadge
				statusValue={order.statusValue}
				statusName={order.statusName}
				fulfillmentTypeValue={order.fulfillmentTypeValue}
				deliveryStatusValue={order.deliveryStatusValue}
				deliveryStatusName={order.deliveryStatusName}
			/>
		</div>
		<span class="order-card__time">{timeAgo}</span>
	</div>

	<div class="order-card__bottom">
		<div class="order-card__meta">
			<span class="order-card__fulfillment">
				{#if isPickup}
					<IconStore class="order-card__fulfillment-icon" />
				{:else}
					<IconDelivery class="order-card__fulfillment-icon" />
				{/if}
				{isPickup ? 'Pickup' : 'Delivery'}
			</span>
			<span class="order-card__dot"></span>
			<span class="order-card__items">{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
		</div>
		<span class="order-card__total">{formatPriceCompact(order.total)}</span>
	</div>
</button>

<style>
	.order-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		padding: 14px 16px;
		border-radius: 12px;
		background: var(--md-sys-color-surface-container);
		border: 1.5px solid var(--md-sys-color-outline-variant);
		text-align: left;
		cursor: pointer;
		transition: border-color 200ms ease, background-color 150ms ease;
	}

	.order-card:hover {
		border-color: var(--md-sys-color-outline);
	}

	.order-card--active {
		border-left: 3px solid var(--md-sys-color-primary);
	}

	.order-card__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.order-card__title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.order-card__order-no {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.order-card__time {
		font-size: 0.75rem;
		color: var(--md-sys-color-outline);
		white-space: nowrap;
	}

	.order-card__bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.order-card__meta {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--md-sys-color-on-surface-variant);
		font-size: 0.8125rem;
	}

	.order-card__fulfillment {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	:global(.order-card__fulfillment-icon) {
		width: 14px;
		height: 14px;
	}

	.order-card__dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--md-sys-color-outline-variant);
	}

	.order-card__items {
		font-size: 0.8125rem;
	}

	.order-card__total {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--md-sys-color-primary);
	}
</style>
