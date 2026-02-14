<script lang="ts">
	import type { MemberOrderDetail } from '$lib/types/order.js';
	import { IconChevronLeft, IconStore, IconDelivery } from '$lib/components/icons/index.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import OrderStatusBadge from './OrderStatusBadge.svelte';
	import DeliveryTrackingMap from './DeliveryTrackingMap.svelte';
	import ProductImage from '$lib/components/shared/ProductImage.svelte';

	interface Props {
		order: MemberOrderDetail;
		onback: () => void;
	}

	let { order, onback }: Props = $props();

	const isPickup = $derived(order.fulfillmentTypeValue === 0);
	const isDelivery = $derived(order.fulfillmentTypeValue === 1);
	const hasDeliveryAddress = $derived(!!order.deliveryStreetAddress);
	const showDeliveryStepper = $derived(
		isDelivery && order.deliveryStatusValue !== undefined && order.statusValue === 0
	);
	const showTrackingMap = $derived(
		isDelivery &&
		order.deliveryStatusValue === 1 &&
		order.deliveryLatitude != null &&
		order.deliveryLongitude != null
	);

	// Delivery status steps: 0=Received, 1=Delivering, 2=Delivered
	const deliverySteps = [
		{ value: 0, label: 'Received' },
		{ value: 1, label: 'Delivering' },
		{ value: 2, label: 'Delivered' }
	];
	const formattedDate = $derived(
		new Date(order.creationTime).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

<div class="order-detail">
	<!-- Header with back button -->
	<div class="order-detail__header">
		<button class="order-detail__back" onclick={onback} aria-label="Back to orders">
			<IconChevronLeft class="order-detail__back-icon" />
		</button>
		<div class="order-detail__header-info">
			<span class="order-detail__order-no">Order #{order.orderNo ?? '---'}</span>
			<span class="order-detail__date">{formattedDate}</span>
		</div>
		<OrderStatusBadge
			statusValue={order.statusValue}
			statusName={order.statusName}
			fulfillmentTypeValue={order.fulfillmentTypeValue}
			deliveryStatusValue={order.deliveryStatusValue}
			deliveryStatusName={order.deliveryStatusName}
		/>
	</div>

	<!-- Content: either wrapped in tracking map or plain scrollable -->
	{#if showTrackingMap}
		<DeliveryTrackingMap deliveryLat={order.deliveryLatitude!} deliveryLng={order.deliveryLongitude!}>
			<div class="order-detail__content">
				{@render orderContent()}
			</div>
		</DeliveryTrackingMap>
	{:else}
		<div class="order-detail__content">
			{@render orderContent()}
		</div>
	{/if}

	{#snippet orderContent()}
		<!-- Fulfillment info -->
		<div class="order-detail__fulfillment">
			<span class="order-detail__fulfillment-label">
				{#if isPickup}
					<IconStore class="order-detail__fulfillment-icon" />
					Pickup
				{:else}
					<IconDelivery class="order-detail__fulfillment-icon" />
					Delivery
				{/if}
			</span>
		</div>

		<!-- Delivery status stepper -->
		{#if showDeliveryStepper}
			<div class="delivery-stepper">
				<span class="order-detail__section-title">Delivery Status</span>
				<div class="delivery-stepper__track">
					{#each deliverySteps as step, i (step.value)}
						{@const currentStatus = order.deliveryStatusValue ?? 0}
						{@const isCompleted = step.value < currentStatus}
						{@const isCurrent = step.value === currentStatus}
						<div class="delivery-stepper__step" class:delivery-stepper__step--completed={isCompleted} class:delivery-stepper__step--current={isCurrent}>
							<div class="delivery-stepper__dot">
								{#if isCompleted}
									<svg class="delivery-stepper__check" viewBox="0 0 16 16" fill="none">
										<path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								{/if}
							</div>
							<span class="delivery-stepper__label">{step.label}</span>
						</div>
						{#if i < deliverySteps.length - 1}
							<div class="delivery-stepper__connector" class:delivery-stepper__connector--completed={step.value < currentStatus}></div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<!-- Delivery address -->
		{#if !isPickup && hasDeliveryAddress}
			<div class="order-detail__address">
				<span class="order-detail__section-title">Delivery Address</span>
				<p class="order-detail__address-line">
					{order.deliveryStreetAddress}{order.deliveryHouseNumber ? ` ${order.deliveryHouseNumber}` : ''}
				</p>
				{#if order.deliveryFloor || order.deliveryBuilding}
					<p class="order-detail__address-secondary">
						{[order.deliveryFloor, order.deliveryBuilding].filter(Boolean).join(', ')}
					</p>
				{/if}
				<p class="order-detail__address-secondary">
					{[order.deliveryPostalCode, order.deliveryCity, order.deliveryCountry].filter(Boolean).join(', ')}
				</p>
			</div>
		{/if}

		<!-- Customer notes -->
		{#if order.customerNotes}
			<div class="order-detail__notes">
				<span class="order-detail__section-title">Notes</span>
				<p class="order-detail__notes-text">{order.customerNotes}</p>
			</div>
		{/if}

		<!-- Items list -->
		<div class="order-detail__items-section">
			<span class="order-detail__section-title">Items ({order.items.length})</span>
			<div class="order-detail__items">
				{#each order.items as item (item.id)}
					<div class="order-detail__item">
						{#if item.productImageUrl}
							<ProductImage
								src={item.productImageUrl}
								alt={item.productName}
								class="order-detail__item-image"
							/>
						{:else}
							<div class="order-detail__item-placeholder">
								<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
									<path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
								</svg>
							</div>
						{/if}
						<div class="order-detail__item-info">
							<span class="order-detail__item-name">{item.productName}</span>
							{#if item.variantName}
								<span class="order-detail__item-variant">{item.variantName}</span>
							{/if}
							<span class="order-detail__item-qty">{item.quantity} x {formatPrice(item.unitPrice)}</span>
						</div>
						<span class="order-detail__item-total">{formatPrice(item.total)}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Order summary -->
		<div class="order-detail__summary">
			<div class="order-detail__summary-row">
				<span>Subtotal</span>
				<span>{formatPrice(order.subtotal)}</span>
			</div>
			{#if order.discount > 0}
				<div class="order-detail__summary-row order-detail__summary-row--discount">
					<span>Discount</span>
					<span>-{formatPrice(order.discount)}</span>
				</div>
			{/if}
			{#if order.vat > 0}
				<div class="order-detail__summary-row">
					<span>VAT</span>
					<span>{formatPrice(order.vat)}</span>
				</div>
			{/if}
			<div class="order-detail__summary-total">
				<span>Total</span>
				<span>{formatPrice(order.total)}</span>
			</div>
		</div>
	{/snippet}
</div>

<style>
	.order-detail {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.order-detail__header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 16px 20px;
		border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.order-detail__back {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 9999px;
		flex-shrink: 0;
		transition: background-color 0.15s ease;
	}

	.order-detail__back:hover {
		background: var(--md-sys-color-surface-container);
	}

	:global(.order-detail__back-icon) {
		width: 20px;
		height: 20px;
		color: var(--md-sys-color-on-surface);
	}

	.order-detail__header-info {
		flex: 1;
		min-width: 0;
	}

	.order-detail__order-no {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.order-detail__date {
		display: block;
		font-size: 0.75rem;
		color: var(--md-sys-color-outline);
	}

	.order-detail__content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.order-detail__section-title {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--md-sys-color-outline);
		margin-bottom: 6px;
	}

	/* Fulfillment */
	.order-detail__fulfillment {
		display: flex;
	}

	.order-detail__fulfillment-label {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		border-radius: 9999px;
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	:global(.order-detail__fulfillment-icon) {
		width: 16px;
		height: 16px;
	}

	/* Address */
	.order-detail__address {
		padding: 12px 14px;
		border-radius: 10px;
		background: var(--md-sys-color-surface-container);
	}

	.order-detail__address-line {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}

	.order-detail__address-secondary {
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}

	/* Notes */
	.order-detail__notes {
		padding: 12px 14px;
		border-radius: 10px;
		background: var(--md-sys-color-surface-container);
	}

	.order-detail__notes-text {
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface-variant);
		line-height: 1.5;
	}

	.order-detail__items {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.order-detail__item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
	}

	:global(.order-detail__item-image) {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		flex-shrink: 0;
		overflow: hidden;
	}

	.order-detail__item-placeholder {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--md-sys-color-surface-container);
	}

	.order-detail__item-placeholder svg {
		width: 20px;
		height: 20px;
		color: var(--md-sys-color-outline-variant);
	}

	.order-detail__item-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.order-detail__item-name {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.order-detail__item-variant {
		font-size: 0.75rem;
		color: var(--md-sys-color-outline);
	}

	.order-detail__item-qty {
		font-size: 0.75rem;
		color: var(--md-sys-color-on-surface-variant);
	}

	.order-detail__item-total {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		white-space: nowrap;
	}

	/* Summary */
	.order-detail__summary {
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
		padding-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.order-detail__summary-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface-variant);
	}

	.order-detail__summary-row--discount {
		color: #4CAF50;
	}

	.order-detail__summary-total {
		display: flex;
		justify-content: space-between;
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
		padding-top: 6px;
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	/* Delivery Stepper */
	.delivery-stepper {
		padding: 12px 14px;
		border-radius: 10px;
		background: var(--md-sys-color-surface-container);
	}

	.delivery-stepper__track {
		display: flex;
		align-items: flex-start;
		gap: 0;
	}

	.delivery-stepper__step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.delivery-stepper__dot {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid var(--md-sys-color-outline-variant);
		background: var(--md-sys-color-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.delivery-stepper__step--completed .delivery-stepper__dot {
		border-color: #009688;
		background: #009688;
	}

	.delivery-stepper__step--current .delivery-stepper__dot {
		border-color: #009688;
		background: color-mix(in srgb, #009688 18%, transparent);
		box-shadow: 0 0 0 3px color-mix(in srgb, #009688 12%, transparent);
	}

	.delivery-stepper__check {
		width: 14px;
		height: 14px;
		color: white;
	}

	.delivery-stepper__label {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--md-sys-color-outline);
		text-align: center;
		max-width: 60px;
	}

	.delivery-stepper__step--current .delivery-stepper__label {
		color: #009688;
		font-weight: 600;
	}

	.delivery-stepper__step--completed .delivery-stepper__label {
		color: var(--md-sys-color-on-surface-variant);
	}

	.delivery-stepper__connector {
		flex: 1;
		height: 2px;
		background: var(--md-sys-color-outline-variant);
		margin-top: 12px;
		min-width: 20px;
		transition: background 0.2s ease;
	}

	.delivery-stepper__connector--completed {
		background: #009688;
	}
</style>
