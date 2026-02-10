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

	const subtotal = $derived(cart.totalPrice);
	const taxRate = 0;
	const taxAmount = $derived(subtotal * taxRate);
	const total = $derived(subtotal + taxAmount);

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
		<div class="flex-1 overflow-y-auto px-3 pt-2">
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
				<div class="flex flex-col gap-2">
					{#each cart.items as item (item.variant ? `${item.product.id}:${item.variant.id}` : item.product.id)}
						<CartItemComponent {item} />
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer with totals card + dual action buttons -->
		{#if !cart.isEmpty}
			<div class="bg-[var(--md-sys-color-surface)] pt-3 pb-6">
				<!-- Totals card -->
				<div class="mx-4 rounded-xl bg-[var(--md-sys-color-surface-container)]/90 p-4">
					<!-- Subtotal -->
					<div class="flex items-center justify-between">
						<span class="text-sm text-[var(--md-sys-color-on-surface-variant)]">Subtotal</span>
						<span class="text-sm font-medium text-[var(--md-sys-color-on-surface)]">{formatPrice(subtotal)}</span>
					</div>
					<!-- Tax -->
					<div class="mt-1.5 flex items-center justify-between">
						<span class="text-sm text-[var(--md-sys-color-on-surface-variant)]">Tax (0%)</span>
						<span class="text-sm font-medium text-[var(--md-sys-color-on-surface)]">{formatPrice(taxAmount)}</span>
					</div>
					<!-- Divider -->
					<div class="my-3 border-t border-[var(--md-sys-color-outline-variant)]/30"></div>
					<!-- Total -->
					<div class="flex items-center justify-between">
						<span class="text-base font-bold text-[var(--md-sys-color-on-surface)]">Total</span>
						<span class="text-xl font-bold text-[var(--md-sys-color-primary)]">{formatPrice(total)}</span>
					</div>
				</div>

				<!-- Dual action buttons -->
				<div class="mt-3 flex gap-3 px-4">
					<!-- Clear button -->
					<button
						class="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--md-sys-color-secondary)] text-base font-medium text-[var(--md-sys-color-on-secondary)] transition-transform active:scale-[0.98]"
						onclick={() => cart.clear()}
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Clear
					</button>

					<!-- Checkout button -->
					<button
						class="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--md-sys-color-primary)] text-base font-medium text-[var(--md-sys-color-on-primary)] shadow-lg shadow-[var(--md-sys-color-primary)]/25 transition-transform active:scale-[0.98]"
						onclick={handleCheckout}
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
						</svg>
						Checkout
					</button>
				</div>
			</div>
		{/if}
	</div>
</Drawer>
