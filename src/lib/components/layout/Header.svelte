<script lang="ts">
	import { getTenantContext } from '$lib/stores/tenant.svelte.js';
	import { productStore } from '$lib/stores/products.svelte.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	const tenantCtx = getTenantContext();

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

<header class="header sticky top-0 z-20 bg-[var(--md-sys-color-surface)]">
	<div class="flex h-14 items-center px-2 sm:px-4">
		<!-- Burger button (stays in DOM, animates width to 0; hidden on desktop) -->
		<div class="burger-wrap lg:!hidden" class:collapsed={expanded}>
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

		<!-- Tenant branding (centered, animates out) -->
		<div class="branding-wrap" class:collapsed={expanded}>
			<div class="flex items-center justify-center gap-2">
				<svg class="h-5 w-5 shrink-0 text-[var(--md-sys-color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
					<path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
				</svg>
				<h1 class="truncate text-base font-semibold text-[var(--md-sys-color-on-surface)]">
					{tenantCtx.value?.name ?? 'Shop'}
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

	/* --- Bottom fade-out into transparency --- */
	.header::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 100%;
		height: 1rem;
		background: linear-gradient(
			to bottom,
			var(--md-sys-color-surface),
			transparent
		);
		pointer-events: none;
	}
</style>
