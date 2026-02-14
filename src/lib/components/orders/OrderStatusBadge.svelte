<script lang="ts">
	interface Props {
		statusValue: number;
		statusName: string;
		fulfillmentTypeValue?: number;
		deliveryStatusValue?: number;
		deliveryStatusName?: string;
	}

	let {
		statusValue,
		statusName,
		fulfillmentTypeValue,
		deliveryStatusValue,
		deliveryStatusName
	}: Props = $props();

	const orderColorMap: Record<number, { bg: string; text: string }> = {
		0: {
			bg: 'color-mix(in srgb, #FFB300 18%, transparent)',
			text: '#FFB300'
		},
		1: {
			bg: 'color-mix(in srgb, #4CAF50 18%, transparent)',
			text: '#4CAF50'
		},
		2: {
			bg: 'color-mix(in srgb, var(--md-sys-color-error) 18%, transparent)',
			text: 'var(--md-sys-color-error)'
		},
		3: {
			bg: 'var(--md-sys-color-surface-container-highest)',
			text: 'var(--md-sys-color-on-surface-variant)'
		}
	};

	// Delivery status colors: 0=Received (amber), 1=Delivering (teal), 2=Delivered (green)
	const deliveryColorMap: Record<number, { bg: string; text: string }> = {
		0: {
			bg: 'color-mix(in srgb, #FFB300 18%, transparent)',
			text: '#FFB300'
		},
		1: {
			bg: 'color-mix(in srgb, #009688 18%, transparent)',
			text: '#009688'
		},
		2: {
			bg: 'color-mix(in srgb, #4CAF50 18%, transparent)',
			text: '#4CAF50'
		}
	};

	const isDelivery = $derived(fulfillmentTypeValue === 1);
	const hasDeliveryStatus = $derived(
		isDelivery && deliveryStatusValue !== undefined && deliveryStatusName !== undefined
	);

	// Use delivery status label when active order is a delivery with delivery status
	const displayName = $derived(
		statusValue === 0 && hasDeliveryStatus ? deliveryStatusName! : statusName
	);

	const colors = $derived.by(() => {
		if (statusValue === 0 && hasDeliveryStatus) {
			return deliveryColorMap[deliveryStatusValue!] ?? orderColorMap[0];
		}
		return orderColorMap[statusValue] ?? orderColorMap[3];
	});
</script>

<span
	class="order-status-badge"
	style="background: {colors.bg}; color: {colors.text};"
>
	{displayName}
</span>

<style>
	.order-status-badge {
		display: inline-flex;
		align-items: center;
		padding: 2px 10px;
		border-radius: 9999px;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		white-space: nowrap;
		line-height: 1.5;
	}
</style>
