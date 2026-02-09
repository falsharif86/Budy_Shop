<script lang="ts">
	import Drawer from '$lib/components/shared/Drawer.svelte';
	import CartItemComponent from './CartItem.svelte';
	import { cart } from '$lib/stores/cart.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import { formatPrice } from '$lib/utils/currency.js';

	interface Props {
		oncheckout?: () => void;
	}

	let { oncheckout }: Props = $props();

	function handleCheckout() {
		ui.closeCartDrawer();
		oncheckout?.();
	}
</script>

<Drawer open={ui.cartDrawerOpen} onclose={() => ui.closeCartDrawer()} zIndex={40}>
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]/30 px-5 py-4">
			<div class="flex items-center gap-2">
				<svg class="h-5 w-5 text-[var(--md-sys-color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
				</svg>
				<h2 class="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
					Cart ({cart.totalItems})
				</h2>
			</div>
			<button
				class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--md-sys-color-surface-container)]"
				onclick={() => ui.closeCartDrawer()}
				aria-label="Close cart"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Items -->
		<div class="flex-1 overflow-y-auto px-5">
			{#if cart.isEmpty}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<svg class="mb-4 h-20 w-20 text-[var(--md-sys-color-outline-variant)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
						<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
					</svg>
					<p class="text-base font-medium text-[var(--md-sys-color-on-surface-variant)]">
						Your cart is empty
					</p>
					<p class="mt-1 text-sm text-[var(--md-sys-color-outline)]">
						Add some products to get started
					</p>
					<button
						class="mt-6 rounded-full bg-[var(--md-sys-color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--md-sys-color-on-primary)]"
						onclick={() => ui.closeCartDrawer()}
					>
						Continue Shopping
					</button>
				</div>
			{:else}
				<div class="divide-y divide-[var(--md-sys-color-outline-variant)]/20">
					{#each cart.items as item (item.variant ? `${item.product.id}:${item.variant.id}` : item.product.id)}
						<CartItemComponent {item} />
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer with totals -->
		{#if !cart.isEmpty}
			<div class="border-t border-[var(--md-sys-color-outline-variant)]/30 bg-[var(--md-sys-color-surface)] p-5">
				<!-- Clear cart -->
				<div class="mb-3 flex items-center justify-between">
					<button
						class="text-sm text-[var(--md-sys-color-error)] hover:underline"
						onclick={() => cart.clear()}
					>
						Clear cart
					</button>
				</div>

				<!-- Totals -->
				<div class="mb-4 flex items-center justify-between">
					<span class="text-base font-medium text-[var(--md-sys-color-on-surface-variant)]">Total</span>
					<span class="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
						{formatPrice(cart.totalPrice)}
					</span>
				</div>

				<!-- Checkout button -->
				<button
					class="w-full rounded-full bg-[var(--md-sys-color-primary)] py-3.5 text-base font-medium text-[var(--md-sys-color-on-primary)] transition-transform active:scale-[0.98]"
					onclick={handleCheckout}
				>
					Checkout
				</button>
			</div>
		{/if}
	</div>
</Drawer>
