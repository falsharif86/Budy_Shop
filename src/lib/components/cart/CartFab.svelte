<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import Badge from '$lib/components/shared/Badge.svelte';

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
	class="fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-200 active:scale-90"
	class:bg-[var(--md-sys-color-primary)]={hasItems}
	class:bg-[var(--md-sys-color-surface-container-highest)]={!hasItems}
	onclick={() => ui.toggleCartDrawer()}
	aria-label="Open cart ({cart.totalItems} items)"
>
	<svg
		class="h-6 w-6 transition-colors"
		class:text-[var(--md-sys-color-on-primary)]={hasItems}
		class:text-[var(--md-sys-color-on-surface)]={!hasItems}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		stroke-width="2"
	>
		<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
	</svg>

	<!-- Badge -->
	{#if cart.totalItems > 0}
		<div class="absolute -right-1 -top-1">
			<Badge count={cart.totalItems} pulse={pulsing} />
		</div>
	{/if}
</button>
