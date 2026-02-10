<script lang="ts">
	import type { CartItem } from '$lib/types/cart.js';
	import { getCartItemPrice, getCartItemName } from '$lib/types/cart.js';
	import { getProductImageUrl } from '$lib/utils/image-url.js';
	import { formatPrice } from '$lib/utils/currency.js';
	import ProductImage from '$lib/components/shared/ProductImage.svelte';
	import { cart } from '$lib/stores/cart.svelte.js';

	interface Props {
		item: CartItem;
	}

	let { item }: Props = $props();

	const name = $derived(getCartItemName(item));
	const imageUrl = $derived(getProductImageUrl(item.product));
	const unitPrice = $derived(getCartItemPrice(item));
	const totalPrice = $derived(unitPrice * item.quantity);
	const variantId = $derived(item.variant?.id ?? null);

	function increment() {
		cart.updateQuantity(item.product.id, variantId, item.quantity + 1);
	}

	function decrement() {
		cart.updateQuantity(item.product.id, variantId, item.quantity - 1);
	}
</script>

<div class="rounded-lg bg-[var(--md-sys-color-surface-container)] p-3">
	<!-- Top row: image + name/unit price + total price -->
	<div class="flex items-start gap-3">
		<!-- Image -->
		<div class="h-10 w-10 shrink-0 overflow-hidden rounded-md shadow-md">
			<ProductImage src={imageUrl} alt={name} class="h-full w-full" />
		</div>

		<!-- Name + unit price -->
		<div class="min-w-0 flex-1">
			<h4 class="line-clamp-2 text-[15px] font-medium leading-tight text-[var(--md-sys-color-on-surface)]">
				{name}
			</h4>
			<p class="mt-0.5 text-xs text-[var(--md-sys-color-on-surface-variant)]">
				{formatPrice(unitPrice)}/unit
			</p>
		</div>

		<!-- Total price -->
		<span class="shrink-0 text-base font-bold text-[var(--md-sys-color-on-surface)]">
			{formatPrice(totalPrice)}
		</span>
	</div>

	<!-- Bottom row: full-width quantity bar -->
	<div class="mt-2.5 flex items-center gap-1 rounded-lg bg-[var(--md-sys-color-surface-container-highest)]/50 p-1">
		<!-- Minus button -->
		<button
			class="flex h-8 w-10 items-center justify-center rounded-md bg-[var(--md-sys-color-secondary)]/10 transition-colors hover:bg-[var(--md-sys-color-secondary)]/20 active:scale-95"
			onclick={decrement}
			aria-label="Decrease quantity"
		>
			<svg class="h-4 w-4 text-[var(--md-sys-color-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
				<path d="M5 12h14" />
			</svg>
		</button>

		<!-- Quantity display -->
		<div class="flex flex-1 items-center justify-center rounded-md border border-[var(--md-sys-color-primary)]/30 bg-[var(--md-sys-color-primary-container)]/30 py-1">
			<span class="text-sm font-bold text-[var(--md-sys-color-on-surface)]">{item.quantity}</span>
		</div>

		<!-- Plus button -->
		<button
			class="flex h-8 w-10 items-center justify-center rounded-md bg-[var(--md-sys-color-primary)]/10 transition-colors hover:bg-[var(--md-sys-color-primary)]/20 active:scale-95"
			onclick={increment}
			aria-label="Increase quantity"
		>
			<svg class="h-4 w-4 text-[var(--md-sys-color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
				<path d="M12 5v14m-7-7h14" />
			</svg>
		</button>
	</div>
</div>
