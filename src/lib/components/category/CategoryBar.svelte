<script lang="ts">
	import type { Category } from '$lib/types/category.js';
	import { productStore } from '$lib/stores/products.svelte.js';

	interface Props {
		categories: Category[];
	}

	let { categories }: Props = $props();
</script>

<div class="flex flex-col gap-2 px-4 py-2">
	<!-- Category chips -->
	<div class="no-scrollbar flex gap-2 overflow-x-auto">
		{#if productStore.selectedCategoryId}
			<button
				class="flex shrink-0 items-center gap-1 rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-1.5 text-sm text-[var(--md-sys-color-on-surface)]"
				onclick={() => productStore.selectCategory(null)}
				aria-label="Clear category filter"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M15 19l-7-7 7-7" />
				</svg>
				All
			</button>
		{/if}

		{#each categories as category (category.id)}
			<button
				class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
				class:bg-[var(--md-sys-color-primary)]={productStore.selectedCategoryId === category.id}
				class:text-[var(--md-sys-color-on-primary)]={productStore.selectedCategoryId === category.id}
				class:bg-[var(--md-sys-color-surface-container)]={productStore.selectedCategoryId !== category.id}
				class:text-[var(--md-sys-color-on-surface)]={productStore.selectedCategoryId !== category.id}
				onclick={() => productStore.selectCategory(
					productStore.selectedCategoryId === category.id ? null : category.id
				)}
			>
				{#if category.iconUrl}
					<img src={category.iconUrl} alt="" class="mr-1 inline-block h-4 w-4" />
				{/if}
				{category.displayName ?? category.name}
			</button>
		{/each}
	</div>
</div>
