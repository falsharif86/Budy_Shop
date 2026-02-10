<script lang="ts">
	import { getTenantContext } from '$lib/stores/tenant.js';
	import { productStore } from '$lib/stores/products.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';

	const tenant = getTenantContext();

	let inputValue = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;
	let inputEl: HTMLInputElement | undefined = $state();

	const expanded = $derived(ui.searchExpanded);

	function handleToggleSearch() {
		if (expanded) {
			handleClear();
			ui.collapseSearch();
		} else {
			ui.toggleSearch();
			setTimeout(() => inputEl?.focus(), 200);
		}
	}

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

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && expanded) {
			handleClear();
			ui.collapseSearch();
		}
	}
</script>

<header class="sticky top-0 z-20 border-b border-[var(--md-sys-color-outline-variant)]/15 bg-[var(--md-sys-color-surface)]/90 backdrop-blur-lg">
	<div class="mx-auto flex h-14 max-w-7xl items-center px-2 sm:px-4">
		<!-- Burger button (stays in DOM, animates width to 0) -->
		<div class="burger-wrap" class:collapsed={expanded}>
			<button
				class="flex h-10 w-10 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]"
				onclick={() => ui.toggleNavDrawer()}
				aria-label="Open navigation menu"
				tabindex={expanded ? -1 : 0}
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
		</div>

		<!-- Tenant branding (stays in DOM, animates out) -->
		<div class="branding-wrap" class:collapsed={expanded}>
			<div class="flex items-center gap-2">
				<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)]">
					<span class="text-xs font-bold text-[var(--md-sys-color-on-primary)]">
						{tenant?.name?.charAt(0)?.toUpperCase() ?? 'B'}
					</span>
				</div>
				<h1 class="truncate text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
					{tenant?.name ?? 'Shop'}
				</h1>
			</div>
		</div>

		<!-- Animated search container -->
		<div class="search-wrap" class:expanded>
			<!-- Input (always in DOM, opacity controlled by CSS) -->
			<input
				bind:this={inputEl}
				type="search"
				placeholder="Search products..."
				value={inputValue}
				oninput={handleInput}
				onkeydown={handleKeydown}
				tabindex={expanded ? 0 : -1}
				class="search-input h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--md-sys-color-on-surface)] outline-none placeholder:text-[var(--md-sys-color-outline)]"
			/>

			<!-- Search / Close icon -->
			<button
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
				onclick={handleToggleSearch}
				aria-label={expanded ? 'Close search' : 'Open search'}
			>
				{#if expanded}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
</header>

<style>
	/* --- Burger button wrapper --- */
	.burger-wrap {
		width: 48px;
		opacity: 1;
		overflow: hidden;
		flex-shrink: 0;
		transition:
			width 300ms cubic-bezier(0.4, 0, 0.2, 1),
			opacity 200ms ease;
	}

	.burger-wrap.collapsed {
		width: 0;
		opacity: 0;
		pointer-events: none;
	}

	/* --- Tenant branding wrapper --- */
	.branding-wrap {
		flex: 1 1 auto;
		min-width: 0;
		opacity: 1;
		overflow: hidden;
		transition:
			flex-grow 300ms cubic-bezier(0.4, 0, 0.2, 1),
			opacity 200ms ease;
	}

	.branding-wrap.collapsed {
		flex: 0 0 0px;
		opacity: 0;
		pointer-events: none;
	}

	/* --- Search wrapper --- */
	.search-wrap {
		display: flex;
		align-items: center;
		flex: 0 0 40px;
		overflow: hidden;
		border-radius: 1.5rem;
		padding-left: 0;
		transition:
			flex-grow 300ms cubic-bezier(0.4, 0, 0.2, 1),
			padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1),
			background-color 250ms ease;
	}

	.search-wrap.expanded {
		flex: 1 1 auto;
		padding-left: 1.25rem;
		background-color: var(--md-sys-color-surface-container);
	}

	/* --- Search input --- */
	.search-input {
		opacity: 0;
		pointer-events: none;
		transition: opacity 200ms ease;
	}

	.search-wrap.expanded .search-input {
		opacity: 1;
		pointer-events: auto;
		transition: opacity 200ms 120ms ease;
	}
</style>
