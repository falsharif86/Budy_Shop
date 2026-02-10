<script lang="ts">
	import type { Category } from '$lib/types/category.js';
	import CategoryBar from './CategoryBar.svelte';

	interface Props {
		categories: Category[];
		scrollY: number;
	}

	let { categories, scrollY }: Props = $props();

	const collapseDistance = 120;

	const progress = $derived(Math.min(scrollY / collapseDistance, 1));
	const opacity = $derived(Math.max(1 - progress * 1.5, 0));
	const translateY = $derived(Math.max(-scrollY * 0.3, -60));
	const hidden = $derived(opacity < 0.01);
</script>

<div
	class="scroll-aware-category-bar"
	style="opacity: {opacity}; transform: translateY({translateY}px); pointer-events: {hidden ? 'none' : 'auto'};"
	aria-hidden={hidden}
>
	<!-- Gradient background behind bar (extends beyond bounds like Flutter version) -->
	<div class="scroll-aware-category-bar__gradient"></div>
	<div class="scroll-aware-category-bar__content">
		<CategoryBar {categories} />
	</div>
</div>

<style>
	.scroll-aware-category-bar {
		position: relative;
		will-change: transform, opacity;
		margin-bottom: 1.5rem;
		overflow: visible;
	}

	.scroll-aware-category-bar__gradient {
		position: absolute;
		left: 0;
		right: 0;
		top: -3.5rem;
		bottom: -2.5rem;
		background: linear-gradient(
			to bottom,
			var(--md-sys-color-surface-container) 0%,
			var(--md-sys-color-surface-container) 65%,
			transparent 100%
		);
		pointer-events: none;
		z-index: 0;
	}

	.scroll-aware-category-bar__content {
		position: relative;
		z-index: 1;
		padding-top: 1rem;
	}
</style>
