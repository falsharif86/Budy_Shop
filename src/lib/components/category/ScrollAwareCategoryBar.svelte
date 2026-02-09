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
	const translateY = $derived(-scrollY * 0.2);
	const collapsed = $derived(opacity < 0.01);
</script>

<div
	class="scroll-aware-category-bar"
	style="
		opacity: {opacity};
		transform: translateY({translateY}px);
		pointer-events: {collapsed ? 'none' : 'auto'};
	"
	class:collapsed
>
	<!-- Gradient background behind bar -->
	<div class="scroll-aware-category-bar__gradient"></div>
	<CategoryBar {categories} />
</div>

<style>
	.scroll-aware-category-bar {
		position: relative;
		will-change: transform, opacity;
	}

	.scroll-aware-category-bar.collapsed {
		height: 0;
		overflow: hidden;
	}

	.scroll-aware-category-bar__gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			var(--md-sys-color-surface-container-low),
			transparent
		);
		pointer-events: none;
		z-index: 0;
	}
</style>
