<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		open: boolean;
		side?: 'right' | 'left';
		onclose: () => void;
		zIndex?: number;
		children: import('svelte').Snippet;
	}

	let { open, side = 'right', onclose, zIndex = 40, children }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	function handleBackdropClick() {
		onclose();
	}

	// Swipe to dismiss
	let startX = $state(0);
	let currentX = $state(0);
	let swiping = $state(false);

	function handleTouchStart(e: TouchEvent) {
		startX = e.touches[0].clientX;
		currentX = startX;
		swiping = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!swiping) return;
		currentX = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		if (!swiping) return;
		const diff = currentX - startX;
		const threshold = 100;
		if (side === 'right' && diff > threshold) onclose();
		if (side === 'left' && diff < -threshold) onclose();
		swiping = false;
		startX = 0;
		currentX = 0;
	}

	const swipeOffset = $derived.by(() => {
		if (!swiping) return 0;
		const diff = currentX - startX;
		if (side === 'right') return Math.max(0, diff);
		return Math.min(0, diff);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 bg-black/40"
		style="z-index: {zIndex}"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		aria-label="Close drawer"
	></button>

	<!-- Drawer panel -->
	<div
		class="fixed inset-y-0 flex flex-col bg-[var(--md-sys-color-surface)] shadow-2xl"
		class:right-0={side === 'right'}
		class:left-0={side === 'left'}
		class:rounded-r-2xl={side === 'left'}
		class:rounded-l-2xl={side === 'right'}
		style="z-index: {zIndex + 1}; width: min(calc(100vw - 56px), 420px); transform: translateX({swipeOffset}px);"
		transition:fly={{
			x: side === 'right' ? 420 : -420,
			duration: 300,
			easing: cubicOut
		}}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		{@render children()}
	</div>
{/if}
