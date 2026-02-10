<script lang="ts">
	import type { ProductVariant } from '$lib/types/product.js';
	import { formatPriceCompact } from '$lib/utils/currency.js';

	interface Props {
		variants: ProductVariant[];
		selected: ProductVariant | null;
		onselect: (variant: ProductVariant) => void;
	}

	let { variants, selected, onselect }: Props = $props();

	const activeVariants = $derived(variants.filter((v) => v.isActive));
</script>

{#if activeVariants.length > 1}
	<div class="variant-selector">
		<span class="variant-selector__label">Options</span>
		<div class="variant-selector__list">
			{#each activeVariants as variant (variant.id)}
				<button
					class="variant-btn"
					class:selected={selected?.id === variant.id}
					class:out-of-stock={variant.stockLevel <= 0}
					disabled={variant.stockLevel <= 0}
					onclick={() => onselect(variant)}
				>
					{variant.name}
					{#if variant.weight}
						({variant.weight}{variant.weightUnit ?? 'g'})
					{/if}
					<span class="variant-btn__price">{formatPriceCompact(variant.price)}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.variant-selector {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.variant-selector__label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
	}

	.variant-selector__list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.variant-btn {
		padding: 8px 16px;
		border-radius: 9999px;
		border: 1px solid var(--md-sys-color-outline-variant);
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.15s ease;
	}

	.variant-btn.selected {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		border-color: var(--md-sys-color-primary);
	}

	.variant-btn.out-of-stock {
		opacity: 0.5;
	}

	.variant-btn__price {
		margin-left: 4px;
		opacity: 0.7;
	}
</style>
