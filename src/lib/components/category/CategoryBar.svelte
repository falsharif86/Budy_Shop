<script lang="ts">
	import type { Category } from '$lib/types/category.js';
	import { productStore } from '$lib/stores/products.svelte.js';
	import { IconMenu, IconChevronLeft } from '$lib/components/icons/index.js';
	import CategoryChip from './CategoryChip.svelte';

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
		productStore.selectCategory(null);
		setTimeout(() => {
			isAnimating = false;
		}, 300);
	}

	function handleSubCategoryClick(subCategoryId: string) {
		const isAlreadySelected = productStore.selectedSubCategoryId === subCategoryId;
		productStore.selectSubCategory(isAlreadySelected ? null : subCategoryId);
	}
</script>

<div class="category-bar-root px-4 pt-3 pb-3">
	<div class="category-slider" class:show-subcategories={showSubcategories}>
		<!-- Categories row -->
		<div class="category-slider__row category-slider__row--categories">
			<div class="no-scrollbar flex gap-2.5 overflow-x-auto">
				<!-- "All" button when a category is selected but subcategories NOT shown -->
				{#if productStore.selectedCategoryId && !showSubcategories}
					<button
						class="category-bar__special-btn"
						onclick={() => productStore.selectCategory(null)}
						aria-label="Clear category filter"
					>
						<IconMenu class="category-bar__special-icon" />
						<span class="category-bar__special-label">All</span>
					</button>
				{/if}

				{#each categories as category (category.id)}
					<CategoryChip
						name={category.name}
						displayName={category.displayName}
						iconUrl={category.iconUrl}
						isSelected={productStore.selectedCategoryId === category.id}
						onclick={() => handleCategoryClick(category.id)}
					/>
				{/each}
			</div>
		</div>

		<!-- Subcategories row -->
		{#if hasSubCategories && productStore.selectedCategoryId}
			<div class="category-slider__row category-slider__row--subcategories">
				<div class="no-scrollbar flex gap-2.5 overflow-x-auto">
					<!-- Back button -->
					<button
						class="category-bar__special-btn category-bar__special-btn--narrow"
						onclick={goBackToCategories}
						aria-label="Back to categories"
					>
						<IconChevronLeft class="category-bar__back-icon" />
						<span class="category-bar__back-label">Back</span>
					</button>

					{#each subCategories as sub (sub.id)}
						<CategoryChip
							name={sub.name}
							displayName={sub.displayName}
							iconUrl={sub.iconUrl}
							isSelected={productStore.selectedSubCategoryId === sub.id}
							fallbackIconPath="M7 7h10v10H7z"
							onclick={() => handleSubCategoryClick(sub.id)}
						/>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* --- Special buttons (All / Back) --- */
	.category-bar__special-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		flex-shrink: 0;
		min-width: 84px;
		height: 76px;
		padding: 10px 12px;
		border-radius: 16px;
		border: 1px solid var(--md-sys-color-outline-variant);
		background: var(--md-sys-color-surface-container-high);
		transition: background-color 0.15s ease;
	}

	.category-bar__special-btn:hover {
		background: var(--md-sys-color-surface-container-highest);
	}

	.category-bar__special-btn--narrow {
		min-width: 64px;
	}

	:global(.category-bar__special-icon) {
		width: 24px;
		height: 24px;
		color: var(--md-sys-color-primary);
	}

	.category-bar__special-label {
		font-size: 11px;
		font-weight: 500;
		line-height: 1;
		color: var(--md-sys-color-on-surface-variant);
	}

	:global(.category-bar__back-icon) {
		width: 20px;
		height: 20px;
		color: var(--md-sys-color-primary);
	}

	.category-bar__back-label {
		font-size: 10px;
		font-weight: 500;
		line-height: 1;
		color: var(--md-sys-color-on-surface-variant);
	}

	/* --- Slider animation (unchanged) --- */
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

	@media (min-width: 1024px) {
		.category-bar-root {
			padding-left: 1rem;
		}
	}
</style>
