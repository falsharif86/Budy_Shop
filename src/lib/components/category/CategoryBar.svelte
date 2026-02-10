<script lang="ts">
	import type { Category } from '$lib/types/category.js';
	import { productStore } from '$lib/stores/products.svelte.js';

	interface Props {
		categories: Category[];
	}

	let { categories }: Props = $props();
</script>

<div class="px-4 pt-3 pb-3">
	<div class="no-scrollbar flex gap-2.5 overflow-x-auto">
		<!-- "All" button when a category is selected -->
		{#if productStore.selectedCategoryId}
			<button
				class="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] px-3 py-2.5 transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)]"
				style="min-width: 84px; height: 76px;"
				onclick={() => productStore.selectCategory(null)}
				aria-label="Clear category filter"
			>
				<svg class="h-6 w-6 text-[var(--md-sys-color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M4 6h16M4 12h16M4 18h16" />
				</svg>
				<span class="text-[11px] font-medium leading-none text-[var(--md-sys-color-on-surface-variant)]">All</span>
			</button>
		{/if}

		{#each categories as category (category.id)}
			{@const isSelected = productStore.selectedCategoryId === category.id}
			<button
				class="group/cat flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 transition-all"
				class:bg-[var(--md-sys-color-primary-container)]={isSelected}
				class:border-[var(--md-sys-color-primary)]={isSelected}
				class:shadow-[0_0_12px_rgba(0,200,150,0.2)]={isSelected}
				class:bg-[var(--md-sys-color-surface-container-high)]={!isSelected}
				class:border-transparent={!isSelected}
				class:hover:bg-[var(--md-sys-color-surface-container-highest)]={!isSelected}
				style="min-width: 84px; height: 76px;"
				onclick={() => productStore.selectCategory(
					isSelected ? null : category.id
				)}
			>
				<!-- Icon -->
				<div class="flex h-7 w-7 items-center justify-center">
					{#if category.iconUrl}
						<img
							src={category.iconUrl}
							alt=""
							class="h-6 w-6 object-contain"
							style={isSelected ? 'filter: brightness(0) saturate(100%) invert(64%) sepia(85%) saturate(400%) hue-rotate(115deg) brightness(95%) contrast(101%);' : 'filter: brightness(0) saturate(100%) invert(73%) sepia(42%) saturate(600%) hue-rotate(115deg) brightness(95%) contrast(95%);'}
						/>
					{:else}
						<svg
							class="h-6 w-6"
							class:text-[var(--md-sys-color-on-primary-container)]={isSelected}
							class:text-[var(--md-sys-color-primary)]={!isSelected}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					{/if}
				</div>

				<!-- Label -->
				<span
					class="max-w-[76px] truncate text-[11px] font-medium leading-none"
					class:text-[var(--md-sys-color-on-primary-container)]={isSelected}
					class:text-[var(--md-sys-color-on-surface-variant)]={!isSelected}
				>
					{category.displayName ?? category.name}
				</span>
			</button>
		{/each}
	</div>
</div>
