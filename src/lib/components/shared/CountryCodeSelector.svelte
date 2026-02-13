<script lang="ts">
	import { fly } from 'svelte/transition';

	export interface Country {
		code: string;
		dial: string;
		name: string;
	}

	const COUNTRIES: Country[] = [
		{ code: 'TH', dial: '66', name: 'Thailand' },
		{ code: 'NL', dial: '31', name: 'Netherlands' },
		{ code: 'US', dial: '1', name: 'United States' },
		{ code: 'GB', dial: '44', name: 'United Kingdom' },
		{ code: 'DE', dial: '49', name: 'Germany' }
	];

	/** Returns a flagcdn.com SVG URL for the given 2-letter country code */
	function flagUrl(code: string): string {
		return `https://flagcdn.com/${code.toLowerCase()}.svg`;
	}

	interface Props {
		selected: Country;
		onselect: (country: Country) => void;
		disabled?: boolean;
	}

	let { selected, onselect, disabled = false }: Props = $props();
	let open = $state(false);

	function toggle() {
		if (!disabled) open = !open;
	}

	function select(country: Country) {
		onselect(country);
		open = false;
	}

	function close() {
		open = false;
	}
</script>

<div class="country-selector">
	<button class="country-pill" onclick={toggle} {disabled} aria-expanded={open} aria-haspopup="listbox">
		<img class="country-flag" src={flagUrl(selected.code)} alt="{selected.code} flag" />
		<span class="country-dial">+{selected.dial}</span>
		<svg class="country-chevron" class:open width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M6 9l6 6 6-6" />
		</svg>
	</button>

	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="country-backdrop" onclick={close} onkeydown={close}></div>
		<ul class="country-dropdown" role="listbox" transition:fly={{ y: -8, duration: 200 }}>
			{#each COUNTRIES as country (country.code)}
				<li role="option" aria-selected={country.code === selected.code}>
					<button class="country-option" class:active={country.code === selected.code} onclick={() => select(country)}>
						<img class="country-flag" src={flagUrl(country.code)} alt="{country.code} flag" />
						<span class="country-name">{country.name}</span>
						<span class="country-dial">+{country.dial}</span>
					</button>
				</li>
			{/each}
		</ul>
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
		object-fit: cover;
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
		min-width: 220px;
		padding: 0.25rem 0;
		margin: 0;
		list-style: none;
		border-radius: var(--md-sys-shape-corner-medium);
		background: var(--md-sys-color-surface-container-high);
		box-shadow: var(--md-sys-elevation-3, 0 1px 3px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08));
		overflow: hidden;
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
</style>
