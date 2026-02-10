<script lang="ts">
	import type { Category } from '$lib/types/category.js';
	import { productStore } from '$lib/stores/products.svelte.js';

	interface Props {
		categories: Category[];
	}

	let { categories }: Props = $props();

	let showSubcategories = $state(false);
	let isAnimating = $state(false);

	const selectedCategory = $derived(
		categories.find((c) => c.id === productStore.selectedCategoryId) ?? null
	);

	const subCategories = $derived(selectedCategory?.subCategories ?? []);
	const hasSubCategories = $derived(subCategories.length > 0);

	function handleCategoryClick(categoryId: string) {
		const isAlreadySelected = productStore.selectedCategoryId === categoryId;

		if (isAlreadySelected) {
			// Deselect category
			if (showSubcategories) {
				goBackToCategories();
			} else {
				productStore.selectCategory(null);
			}
			return;
		}

		productStore.selectCategory(categoryId);

		// Check if the newly selected category has subcategories
		const cat = categories.find((c) => c.id === categoryId);
		if (cat && cat.subCategories.length > 0) {
			slideToSubcategories();
		}
	}

	function slideToSubcategories() {
		if (isAnimating) return;
		isAnimating = true;
		showSubcategories = true;
		setTimeout(() => {
			isAnimating = false;
		}, 300);
	}

	function goBackToCategories() {
		if (isAnimating) return;
		isAnimating = true;
		showSubcategories = false;
		productStore.selectSubCategory(null);
		setTimeout(() => {
			isAnimating = false;
		}, 300);
	}

	function handleSubCategoryClick(subCategoryId: string) {
		const isAlreadySelected = productStore.selectedSubCategoryId === subCategoryId;
		productStore.selectSubCategory(isAlreadySelected ? null : subCategoryId);
	}
</script>

<div class="px-4 pt-3 pb-3">
	<div class="category-slider" class:show-subcategories={showSubcategories}>
		<!-- Categories row -->
		<div class="category-slider__row category-slider__row--categories">
			<div class="no-scrollbar flex gap-2.5 overflow-x-auto">
				<!-- "All" button when a category is selected but subcategories NOT shown -->
				{#if productStore.selectedCategoryId && !showSubcategories}
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
						onclick={() => handleCategoryClick(category.id)}
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

		<!-- Subcategories row -->
		{#if hasSubCategories && productStore.selectedCategoryId}
			<div class="category-slider__row category-slider__row--subcategories">
				<div class="no-scrollbar flex gap-2.5 overflow-x-auto">
					<!-- Back button -->
					<button
						class="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] px-3 py-2.5 transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)]"
						style="min-width: 64px; height: 76px;"
						onclick={goBackToCategories}
						aria-label="Back to categories"
					>
						<svg class="h-5 w-5 text-[var(--md-sys-color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
						<span class="text-[10px] font-medium leading-none text-[var(--md-sys-color-on-surface-variant)]">Back</span>
					</button>

					<!-- "All in category" button -->
					<button
						class="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 transition-all"
						class:bg-[var(--md-sys-color-primary-container)]={!productStore.selectedSubCategoryId}
						class:border-[var(--md-sys-color-primary)]={!productStore.selectedSubCategoryId}
						class:shadow-[0_0_12px_rgba(0,200,150,0.2)]={!productStore.selectedSubCategoryId}
						class:bg-[var(--md-sys-color-surface-container-high)]={!!productStore.selectedSubCategoryId}
						class:border-transparent={!!productStore.selectedSubCategoryId}
						class:hover:bg-[var(--md-sys-color-surface-container-highest)]={!!productStore.selectedSubCategoryId}
						style="min-width: 84px; height: 76px;"
						onclick={() => productStore.selectSubCategory(null)}
					>
						<svg
							class="h-6 w-6"
							class:text-[var(--md-sys-color-on-primary-container)]={!productStore.selectedSubCategoryId}
							class:text-[var(--md-sys-color-primary)]={!!productStore.selectedSubCategoryId}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path d="M4 6h16M4 12h16M4 18h16" />
						</svg>
						<span
							class="max-w-[76px] truncate text-[11px] font-medium leading-none"
							class:text-[var(--md-sys-color-on-primary-container)]={!productStore.selectedSubCategoryId}
							class:text-[var(--md-sys-color-on-surface-variant)]={!!productStore.selectedSubCategoryId}
						>
							All
						</span>
					</button>

					{#each subCategories as sub (sub.id)}
						{@const isSubSelected = productStore.selectedSubCategoryId === sub.id}
						<button
							class="group/sub flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 transition-all"
							class:bg-[var(--md-sys-color-primary-container)]={isSubSelected}
							class:border-[var(--md-sys-color-primary)]={isSubSelected}
							class:shadow-[0_0_12px_rgba(0,200,150,0.2)]={isSubSelected}
							class:bg-[var(--md-sys-color-surface-container-high)]={!isSubSelected}
							class:border-transparent={!isSubSelected}
							class:hover:bg-[var(--md-sys-color-surface-container-highest)]={!isSubSelected}
							style="min-width: 84px; height: 76px;"
							onclick={() => handleSubCategoryClick(sub.id)}
						>
							<!-- Icon -->
							<div class="flex h-7 w-7 items-center justify-center">
								{#if sub.iconUrl}
									<img
										src={sub.iconUrl}
										alt=""
										class="h-6 w-6 object-contain"
										style={isSubSelected ? 'filter: brightness(0) saturate(100%) invert(64%) sepia(85%) saturate(400%) hue-rotate(115deg) brightness(95%) contrast(101%);' : 'filter: brightness(0) saturate(100%) invert(73%) sepia(42%) saturate(600%) hue-rotate(115deg) brightness(95%) contrast(95%);'}
									/>
								{:else}
									<svg
										class="h-6 w-6"
										class:text-[var(--md-sys-color-on-primary-container)]={isSubSelected}
										class:text-[var(--md-sys-color-primary)]={!isSubSelected}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path d="M7 7h10v10H7z" />
									</svg>
								{/if}
							</div>

							<!-- Label -->
							<span
								class="max-w-[76px] truncate text-[11px] font-medium leading-none"
								class:text-[var(--md-sys-color-on-primary-container)]={isSubSelected}
								class:text-[var(--md-sys-color-on-surface-variant)]={!isSubSelected}
							>
								{sub.displayName ?? sub.name}
							</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.category-slider {
		position: relative;
		overflow: hidden;
	}

	.category-slider__row {
		transition: transform 300ms ease-in-out, opacity 300ms ease-in-out;
	}

	.category-slider__row--categories {
		transform: translateX(0);
		opacity: 1;
	}

	.category-slider.show-subcategories .category-slider__row--categories {
		transform: translateX(-100%);
		opacity: 0;
		pointer-events: none;
		position: absolute;
		inset: 0;
	}

	.category-slider__row--subcategories {
		transform: translateX(100%);
		opacity: 0;
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.category-slider.show-subcategories .category-slider__row--subcategories {
		transform: translateX(0);
		opacity: 1;
		position: relative;
		pointer-events: auto;
	}
</style>
