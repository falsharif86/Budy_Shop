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

	function remove() {
		cart.removeItem(item.product.id, variantId);
	}
</script>

<div class="flex gap-3 py-3">
	<!-- Image -->
	<div class="h-16 w-16 shrink-0 overflow-hidden rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)]">
		<ProductImage src={imageUrl} alt={name} class="h-full w-full" />
	</div>

	<!-- Details -->
	<div class="flex flex-1 flex-col justify-between">
		<div class="flex items-start justify-between">
			<h4 class="line-clamp-2 text-sm font-medium leading-tight text-[var(--md-sys-color-on-surface)]">
				{name}
			</h4>
			<button
				class="ml-2 shrink-0 text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-error)]"
				onclick={remove}
				aria-label="Remove {name}"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="flex items-center justify-between">
			<!-- Quantity controls -->
			<div class="flex items-center gap-1">
				<button
					class="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
					onclick={decrement}
					aria-label="Decrease"
				>
					<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
						<path d="M5 12h14" />
					</svg>
				</button>
				<span class="w-6 text-center text-sm font-medium">{item.quantity}</span>
				<button
					class="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
					onclick={increment}
					aria-label="Increase"
				>
					<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
						<path d="M12 5v14m-7-7h14" />
					</svg>
				</button>
			</div>

			<span class="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
				{formatPrice(totalPrice)}
			</span>
		</div>
	</div>
</div>
