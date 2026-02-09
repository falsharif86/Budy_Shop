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
	<div class="flex flex-col gap-2">
		<span class="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
			Options
		</span>
		<div class="flex flex-wrap gap-2">
			{#each activeVariants as variant (variant.id)}
				<button
					class="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
					class:bg-[var(--md-sys-color-primary)]={selected?.id === variant.id}
					class:text-[var(--md-sys-color-on-primary)]={selected?.id === variant.id}
					class:border-[var(--md-sys-color-primary)]={selected?.id === variant.id}
					class:bg-[var(--md-sys-color-surface-container)]={selected?.id !== variant.id}
					class:text-[var(--md-sys-color-on-surface)]={selected?.id !== variant.id}
					class:border-[var(--md-sys-color-outline-variant)]={selected?.id !== variant.id}
					class:opacity-50={variant.stockLevel <= 0}
					disabled={variant.stockLevel <= 0}
					onclick={() => onselect(variant)}
				>
					{variant.name}
					{#if variant.weight}
						({variant.weight}{variant.weightUnit ?? 'g'})
					{/if}
					<span class="ml-1 opacity-70">{formatPriceCompact(variant.price)}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}
