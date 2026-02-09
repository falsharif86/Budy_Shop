<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import { getProductName } from '$lib/utils/eav.js';
	import { getCartItemPrice, getCartItemName } from '$lib/types/cart.js';
	import OrderSuccess from './OrderSuccess.svelte';

	type CheckoutStep = 'review' | 'payment' | 'processing' | 'success';

	let step = $state<CheckoutStep>('review');
	let selectedPayment = $state<'cash' | 'card' | null>(null);

	interface Props {
		onback: () => void;
	}

	let { onback }: Props = $props();

	async function handlePlaceOrder() {
		if (!selectedPayment) return;
		step = 'processing';

		// Simulate order submission (backend endpoint needed)
		await new Promise((resolve) => setTimeout(resolve, 2000));

		step = 'success';
		cart.clear();
	}

	function handleContinueShopping() {
		step = 'review';
		selectedPayment = null;
		onback();
	}
</script>

<div class="mx-auto max-w-lg px-4 py-6">
	{#if step === 'review'}
		<!-- Order Review -->
		<h2 class="mb-6 text-xl font-semibold text-[var(--md-sys-color-on-surface)]">Order Review</h2>

		<div class="mb-6 divide-y divide-[var(--md-sys-color-outline-variant)]/20 rounded-[var(--md-sys-shape-corner-large)] bg-[var(--md-sys-color-surface-container)] p-4">
			{#each cart.items as item (item.variant ? `${item.product.id}:${item.variant.id}` : item.product.id)}
				<div class="flex items-center justify-between py-2">
					<div>
						<span class="text-sm font-medium">{getCartItemName(item, (p) => getProductName(p))}</span>
						<span class="ml-2 text-xs text-[var(--md-sys-color-outline)]">x{item.quantity}</span>
					</div>
					<span class="text-sm font-semibold">{formatPrice(getCartItemPrice(item) * item.quantity)}</span>
				</div>
			{/each}
		</div>

		<div class="mb-6 flex items-center justify-between text-lg font-bold">
			<span>Total</span>
			<span>{formatPrice(cart.totalPrice)}</span>
		</div>

		<!-- Payment selection -->
		<h3 class="mb-3 text-base font-medium text-[var(--md-sys-color-on-surface-variant)]">Payment Method</h3>
		<div class="mb-6 flex flex-col gap-2">
			<button
				class="flex items-center gap-3 rounded-[var(--md-sys-shape-corner-medium)] border p-4 transition-colors"
				class:border-[var(--md-sys-color-primary)]={selectedPayment === 'cash'}
				class:bg-[var(--md-sys-color-primary-container)]={selectedPayment === 'cash'}
				class:border-[var(--md-sys-color-outline-variant)]={selectedPayment !== 'cash'}
				onclick={() => (selectedPayment = 'cash')}
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
				</svg>
				<div class="text-left">
					<span class="text-sm font-medium">Cash</span>
					<span class="block text-xs text-[var(--md-sys-color-outline)]">Pay at pickup</span>
				</div>
			</button>

			<button
				class="flex items-center gap-3 rounded-[var(--md-sys-shape-corner-medium)] border p-4 transition-colors"
				class:border-[var(--md-sys-color-primary)]={selectedPayment === 'card'}
				class:bg-[var(--md-sys-color-primary-container)]={selectedPayment === 'card'}
				class:border-[var(--md-sys-color-outline-variant)]={selectedPayment !== 'card'}
				onclick={() => (selectedPayment = 'card')}
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
				</svg>
				<div class="text-left">
					<span class="text-sm font-medium">Card</span>
					<span class="block text-xs text-[var(--md-sys-color-outline)]">Pay online</span>
				</div>
			</button>
		</div>

		<!-- Actions -->
		<div class="flex gap-3">
			<button
				class="flex-1 rounded-full border border-[var(--md-sys-color-outline-variant)] py-3 text-sm font-medium text-[var(--md-sys-color-on-surface)]"
				onclick={onback}
			>
				Back
			</button>
			<button
				class="flex-1 rounded-full py-3 text-sm font-medium transition-opacity"
				class:bg-[var(--md-sys-color-primary)]={selectedPayment}
				class:text-[var(--md-sys-color-on-primary)]={selectedPayment}
				class:bg-[var(--md-sys-color-surface-container)]={!selectedPayment}
				class:text-[var(--md-sys-color-outline)]={!selectedPayment}
				class:opacity-60={!selectedPayment}
				disabled={!selectedPayment}
				onclick={handlePlaceOrder}
			>
				Place Order
			</button>
		</div>
	{:else if step === 'processing'}
		<!-- Processing -->
		<div class="flex flex-col items-center justify-center py-20">
			<div class="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[var(--md-sys-color-surface-container)] border-t-[var(--md-sys-color-primary)]"></div>
			<p class="text-base font-medium text-[var(--md-sys-color-on-surface)]">Processing your order...</p>
		</div>
	{:else if step === 'success'}
		<OrderSuccess oncontinue={handleContinueShopping} />
	{/if}
</div>
