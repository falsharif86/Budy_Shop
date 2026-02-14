<script lang="ts">
	interface Props {
		statusValue: number;
		statusName: string;
	}

	let { statusValue, statusName }: Props = $props();

	const colorMap: Record<number, { bg: string; text: string }> = {
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

	const colors = $derived(colorMap[statusValue] ?? colorMap[3]);
</script>

<span
	class="order-status-badge"
	style="background: {colors.bg}; color: {colors.text};"
>
	{statusName}
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
