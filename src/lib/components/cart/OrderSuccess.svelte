<script lang="ts">
	import { orderStore } from '$lib/stores/orders.svelte.js';
	import { formatPrice } from '$lib/utils/currency.js';

	interface Props {
		oncontinue: () => void;
	}

	let { oncontinue }: Props = $props();

	const order = $derived(orderStore.lastPlacedOrder);
</script>

<div class="success-page" style="animation: fade-in 400ms ease-out;">
	<!-- Checkmark circle -->
	<div class="success-icon" style="animation: stagger-in 400ms ease-out;">
		<svg class="success-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
			<path
				d="M5 13l4 4L19 7"
				stroke-dasharray="24"
				stroke-dashoffset="24"
				style="animation: checkmark-draw 500ms 200ms ease-out forwards;"
			/>
		</svg>
	</div>

	<h2 class="success-title">Order Placed!</h2>

	{#if order}
		<div class="order-summary">
			{#if order.orderNo}
				<div class="order-summary__number">#{order.orderNo}</div>
			{/if}
			<div class="order-summary__details">
				<span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
				<span class="order-summary__dot"></span>
				<span>{formatPrice(order.total)}</span>
				<span class="order-summary__dot"></span>
				<span>Pickup</span>
			</div>
		</div>
	{/if}

	<p class="success-subtitle">Your order has been received. We'll notify you when it's ready.</p>

	<button class="success-btn" onclick={oncontinue}>
		Continue Shopping
	</button>
</div>

<style>
	.success-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64px 0;
		text-align: center;
	}

	.success-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		border-radius: 9999px;
		background: var(--md-sys-color-primary-container);
		margin-bottom: 24px;
	}

	.success-icon__svg {
		width: 40px;
		height: 40px;
		color: var(--md-sys-color-primary);
	}

	.success-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		margin-bottom: 12px;
	}

	/* --- Order summary card --- */
	.order-summary {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 12px 24px;
		margin-bottom: 12px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--md-sys-color-surface-container) 90%, transparent);
	}

	.order-summary__number {
		font-size: 1rem;
		font-weight: 700;
		color: var(--md-sys-color-primary);
		letter-spacing: 0.02em;
	}

	.order-summary__details {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface-variant);
	}

	.order-summary__dot {
		width: 3px;
		height: 3px;
		border-radius: 9999px;
		background: var(--md-sys-color-outline);
	}

	.success-subtitle {
		font-size: 0.875rem;
		color: var(--md-sys-color-outline);
		margin-bottom: 32px;
	}

	.success-btn {
		padding: 12px 32px;
		border-radius: 9999px;
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		font-weight: 500;
		cursor: pointer;
	}
</style>
