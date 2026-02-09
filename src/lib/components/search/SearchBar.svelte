<script lang="ts">
	import { productStore } from '$lib/stores/products.svelte.js';

	let inputValue = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inputValue = target.value;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			productStore.setSearch(inputValue);
		}, 250);
	}

	function handleClear() {
		inputValue = '';
		productStore.setSearch('');
	}
</script>

<div class="relative px-4">
	<div class="relative flex h-12 items-center rounded-3xl bg-[var(--md-sys-color-surface-container)]">
		<!-- Search icon -->
		<svg
			class="ml-4 h-5 w-5 shrink-0 text-[var(--md-sys-color-outline)]"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>

		<input
			type="search"
			placeholder="Search Products"
			value={inputValue}
			oninput={handleInput}
			class="h-full flex-1 bg-transparent px-3 text-sm text-[var(--md-sys-color-on-surface)] outline-none placeholder:text-[var(--md-sys-color-outline)]"
		/>

		<!-- Clear button -->
		{#if inputValue}
			<button
				class="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--md-sys-color-outline)] transition-colors hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]"
				onclick={handleClear}
				aria-label="Clear search"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}

		<!-- Scanner icon (decorative, matches POS) -->
		<div class="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--md-sys-color-outline)]">
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
				<path d="M7 12h10" />
			</svg>
		</div>
	</div>
</div>
