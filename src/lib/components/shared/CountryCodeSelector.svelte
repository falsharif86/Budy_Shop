<script lang="ts">
	import { fly } from 'svelte/transition';
	import { COUNTRIES, type Country } from '$lib/data/countries.js';

	export type { Country };

	interface Props {
		selected: Country;
		onselect: (country: Country) => void;
		disabled?: boolean;
	}

	let { selected, onselect, disabled = false }: Props = $props();
	let open = $state(false);
	let search = $state('');
	let searchInput: HTMLInputElement | undefined = $state();

	const filtered = $derived.by(() => {
		if (!search) return COUNTRIES;
		const q = search.toLowerCase();
		return COUNTRIES.filter(
			(c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q)
		);
	});

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) {
			search = '';
			setTimeout(() => searchInput?.focus(), 50);
		}
	}

	function select(country: Country) {
		onselect(country);
		open = false;
		search = '';
	}

	function close() {
		open = false;
		search = '';
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<div class="country-selector">
	<button class="country-pill" onclick={toggle} {disabled} aria-expanded={open} aria-haspopup="listbox">
		<span class="fi fi-{selected.code.toLowerCase()} fis country-flag"></span>
		<span class="country-dial">+{selected.dial}</span>
		<svg class="country-chevron" class:open width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M6 9l6 6 6-6" />
		</svg>
	</button>

	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="country-backdrop" onclick={close} onkeydown={close}></div>
		<div class="country-dropdown" transition:fly={{ y: -8, duration: 200 }}>
			<div class="country-search-wrap">
				<input
					bind:this={searchInput}
					type="text"
					class="country-search"
					placeholder="Search countries..."
					bind:value={search}
					onkeydown={handleSearchKeydown}
				/>
			</div>
			<ul class="country-list" role="listbox">
				{#each filtered as country (country.code)}
					<li role="option" aria-selected={country.code === selected.code}>
						<button class="country-option" class:active={country.code === selected.code} onclick={() => select(country)}>
							<span class="fi fi-{country.code.toLowerCase()} fis country-flag"></span>
							<span class="country-name">{country.name}</span>
							<span class="country-dial">+{country.dial}</span>
						</button>
					</li>
				{/each}
				{#if filtered.length === 0}
					<li class="country-empty">No countries found</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>

<style>
	.country-selector {
		position: relative;
	}

	.country-pill {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		border: none;
		border-radius: var(--md-sys-shape-corner-full, 24px);
		background: var(--md-sys-color-surface-container-high);
		color: var(--md-sys-color-on-surface);
		font: var(--md-sys-typescale-label-large);
		cursor: pointer;
		transition: background 200ms;
		white-space: nowrap;
	}

	.country-pill:hover:not(:disabled) {
		background: var(--md-sys-color-surface-container-highest);
	}

	.country-pill:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.country-flag {
		width: 1.5rem;
		height: 1.125rem;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.country-chevron {
		width: 1rem;
		height: 1rem;
		transition: transform 200ms;
	}

	.country-chevron.open {
		transform: rotate(180deg);
	}

	.country-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10;
	}

	.country-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		z-index: 11;
		min-width: 280px;
		border-radius: var(--md-sys-shape-corner-medium);
		background: var(--md-sys-color-surface-container-high);
		box-shadow: var(--md-sys-elevation-3, 0 1px 3px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08));
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.country-search-wrap {
		padding: 0.5rem;
		border-bottom: 1px solid var(--md-sys-color-outline-variant);
	}

	.country-search {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-small, 8px);
		background: var(--md-sys-color-surface);
		color: var(--md-sys-color-on-surface);
		font: var(--md-sys-typescale-body-medium);
		outline: none;
	}

	.country-search:focus {
		border-color: var(--md-sys-color-primary);
	}

	.country-search::placeholder {
		color: var(--md-sys-color-outline);
	}

	.country-list {
		max-height: 240px;
		overflow-y: auto;
		padding: 0.25rem 0;
		margin: 0;
		list-style: none;
	}

	.country-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.625rem 1rem;
		border: none;
		background: transparent;
		color: var(--md-sys-color-on-surface);
		font: var(--md-sys-typescale-body-medium);
		cursor: pointer;
		transition: background 150ms;
		text-align: left;
	}

	.country-option:hover {
		background: var(--md-sys-color-surface-container-highest);
	}

	.country-option.active {
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
	}

	.country-name {
		flex: 1;
	}

	.country-dial {
		color: var(--md-sys-color-outline);
		font: var(--md-sys-typescale-label-medium);
	}

	.country-option .country-dial {
		font: var(--md-sys-typescale-body-medium);
	}

	.country-empty {
		padding: 1rem;
		text-align: center;
		color: var(--md-sys-color-outline);
		font: var(--md-sys-typescale-body-medium);
	}
</style>
