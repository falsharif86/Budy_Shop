<script lang="ts">
	import { getPlaceholderUrl } from '$lib/utils/image-url.js';

	interface Props {
		src: string;
		alt: string;
		class?: string;
	}

	let { src, alt, class: className = '' }: Props = $props();

	let error = $state(false);
	let loaded = $state(false);

	function handleError() {
		error = true;
	}

	function handleLoad() {
		loaded = true;
	}

	const displaySrc = $derived(error ? getPlaceholderUrl() : src);
</script>

<div class="relative overflow-hidden {className}">
	{#if !loaded && !error}
		<div class="absolute inset-0 animate-pulse bg-[var(--md-sys-color-surface-container)]"></div>
	{/if}
	<img
		src={displaySrc}
		{alt}
		class="h-full w-full object-contain transition-opacity duration-300"
		class:opacity-0={!loaded && !error}
		class:opacity-100={loaded || error}
		onerror={handleError}
		onload={handleLoad}
		loading="lazy"
	/>
</div>
