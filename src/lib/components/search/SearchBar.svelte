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
	<div class="relative">
		<!-- Search icon -->
		<svg
			class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--md-sys-color-outline)]"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>

		<input
			type="search"
			placeholder="Search products..."
			value={inputValue}
			oninput={handleInput}
			class="w-full rounded-full bg-[var(--md-sys-color-surface-container-high)] py-2.5 pl-10 pr-10 text-sm text-[var(--md-sys-color-on-surface)] outline-none placeholder:text-[var(--md-sys-color-outline)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
		/>

		<!-- Clear button -->
		{#if inputValue}
			<button
				class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-on-surface)]"
				onclick={handleClear}
				aria-label="Clear search"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>
</div>
