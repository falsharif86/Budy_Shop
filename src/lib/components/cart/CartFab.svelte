<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import Badge from '$lib/components/shared/Badge.svelte';
	import { IconCart } from '$lib/components/icons/index.js';

	let prevCount = $state(0);
	let pulsing = $state(false);

	// Pulse on count increase
	$effect(() => {
		const count = cart.totalItems;
		if (count > prevCount && prevCount > 0) {
			pulsing = true;
			setTimeout(() => (pulsing = false), 300);
		}
		prevCount = count;
	});

	const hasItems = $derived(cart.totalItems > 0);
</script>

<button
	class="cart-fab"
	class:has-items={hasItems}
	onclick={() => ui.toggleCartDrawer()}
	aria-label="Open cart ({cart.totalItems} items)"
>
	<IconCart class="cart-fab__icon" />

	<!-- Badge -->
	{#if cart.totalItems > 0}
		<div class="cart-fab__badge">
			<Badge count={cart.totalItems} pulse={pulsing} />
		</div>
	{/if}
</button>

<style>
	.cart-fab {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 9999px;
		background: var(--md-sys-color-surface-container-highest);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.2s ease;
	}

	.cart-fab:active {
		transform: scale(0.9);
	}

	.cart-fab.has-items {
		background: var(--md-sys-color-primary);
	}

	:global(.cart-fab__icon) {
		width: 24px;
		height: 24px;
		color: var(--md-sys-color-on-surface);
		transition: color 0.2s ease;
	}

	.cart-fab.has-items :global(.cart-fab__icon) {
		color: var(--md-sys-color-on-primary);
	}

	.cart-fab__badge {
		position: absolute;
		top: -4px;
		right: -4px;
	}
</style>
