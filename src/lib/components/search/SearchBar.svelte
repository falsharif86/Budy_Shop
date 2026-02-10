<script lang="ts">
	import { onDestroy } from 'svelte';
	import { productStore } from '$lib/stores/products.svelte.js';
	import { IconSearch, IconClose } from '$lib/components/icons/index.js';

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

	onDestroy(() => clearTimeout(debounceTimer));
</script>

<div class="search-bar">
	<div class="search-bar__container">
		<!-- Search icon -->
		<IconSearch class="search-bar__icon" />

		<input
			type="search"
			placeholder="Search Products"
			value={inputValue}
			oninput={handleInput}
			class="search-bar__input"
		/>

		<!-- Clear button -->
		{#if inputValue}
			<button
				class="search-bar__clear-btn"
				onclick={handleClear}
				aria-label="Clear search"
			>
				<IconClose class="search-bar__clear-icon" />
			</button>
		{/if}

		<!-- Scanner icon (decorative, matches POS) -->
		<div class="search-bar__scanner">
			<svg class="search-bar__scanner-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
				<path d="M7 12h10" />
			</svg>
		</div>
	</div>
</div>

<style>
	.search-bar {
		position: relative;
		padding: 0 16px;
	}

	.search-bar__container {
		position: relative;
		display: flex;
		align-items: center;
		height: 48px;
		border-radius: 24px;
		background: var(--md-sys-color-surface-container);
	}

	.search-bar__icon {
		margin-left: 16px;
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		color: var(--md-sys-color-outline);
	}

	.search-bar__input {
		flex: 1;
		height: 100%;
		padding: 0 12px;
		background: transparent;
		border: none;
		outline: none;
		font-size: 0.875rem;
		color: var(--md-sys-color-on-surface);
	}

	.search-bar__input::placeholder {
		color: var(--md-sys-color-outline);
	}

	.search-bar__clear-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		margin-right: 4px;
		border-radius: 9999px;
		color: var(--md-sys-color-outline);
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.search-bar__clear-btn:hover {
		background: var(--md-sys-color-surface-container-high);
		color: var(--md-sys-color-on-surface);
	}

	.search-bar__clear-icon {
		width: 16px;
		height: 16px;
	}

	.search-bar__scanner {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		margin-right: 12px;
		border-radius: 9999px;
		color: var(--md-sys-color-outline);
	}

	.search-bar__scanner-icon {
		width: 20px;
		height: 20px;
	}
</style>
