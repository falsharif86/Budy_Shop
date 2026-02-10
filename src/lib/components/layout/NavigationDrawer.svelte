<script lang="ts">
	import Drawer from '$lib/components/shared/Drawer.svelte';
	import { getTenantContext } from '$lib/stores/tenant.js';
	import { ui } from '$lib/stores/ui.svelte.js';
	import budyLogo from '$lib/assets/budy_logo.svg';

	const tenant = getTenantContext();

	// Placeholder until auth system exists
	let isLoggedIn = $state(false);

	const menuItems = [
		{
			label: 'My Orders',
			icon: 'orders',
		},
		{
			label: 'My Addresses',
			icon: 'address',
		},
		{
			label: 'Payment Methods',
			icon: 'payment',
		},
		{
			label: 'Help & Support',
			icon: 'help',
		},
	] as const;

	let activeItem = $state<string | null>(null);

	function handleItemClick(label: string) {
		activeItem = label;
		// Navigation not wired yet — just close drawer
		ui.closeNavDrawer();
	}
</script>

<Drawer open={ui.navDrawerOpen} side="left" onclose={() => ui.closeNavDrawer()}>
	<div class="nav-drawer">
		<!-- Header: Logo + Tenant Name -->
		<div class="nav-header">
			<img src={budyLogo} alt="Budy" class="nav-logo" />
			<span class="nav-tenant">{tenant?.name ?? 'Shop'}</span>
		</div>

		<!-- Menu Items -->
		<nav class="nav-menu">
			{#each menuItems as item}
				<button
					class="nav-item"
					class:active={activeItem === item.label}
					onclick={() => handleItemClick(item.label)}
				>
					<div class="nav-icon-box">
						{#if item.icon === 'orders'}
							<svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
							</svg>
						{:else if item.icon === 'address'}
							<svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						{:else if item.icon === 'payment'}
							<svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
							</svg>
						{:else if item.icon === 'help'}
							<svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{/if}
					</div>
					<span class="nav-label">{item.label}</span>
					<svg class="nav-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M9 5l7 7-7 7" />
					</svg>
				</button>
			{/each}
		</nav>

		<!-- Separator -->
		<div class="nav-separator"></div>

		<!-- Bottom Section -->
		<div class="nav-bottom">
			{#if isLoggedIn}
				<!-- User card -->
				<button class="user-card" onclick={() => ui.closeNavDrawer()}>
					<div class="user-avatar">
						<span class="user-initial">J</span>
					</div>
					<div class="user-info">
						<span class="user-email">john@example.com</span>
					</div>
					<svg class="user-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M9 5l7 7-7 7" />
					</svg>
				</button>
			{:else}
				<!-- Sign in button -->
				<button class="sign-in-btn" onclick={() => ui.closeNavDrawer()}>
					<svg class="sign-in-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
						<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
					</svg>
					<span class="sign-in-label">Sign in</span>
				</button>
			{/if}
		</div>
	</div>
</Drawer>

<style>
	.nav-drawer {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0;
	}

	/* ---- Header ---- */
	.nav-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem 1.25rem 1.25rem;
	}

	.nav-logo {
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
	}

	.nav-tenant {
		font: var(--md-sys-typescale-title-large);
		color: var(--md-sys-color-on-surface);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ---- Menu ---- */
	.nav-menu {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		flex: 1;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.625rem 0.75rem;
		border-radius: var(--md-sys-shape-corner-medium);
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--md-sys-color-on-surface-variant);
		transition: background-color 150ms ease, color 150ms ease;
		text-align: left;
		width: 100%;
	}

	.nav-item:hover {
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);
	}

	.nav-item.active {
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-primary);
	}

	.nav-icon-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--md-sys-shape-corner-small);
		background: var(--md-sys-color-surface-container-high);
		flex-shrink: 0;
	}

	.nav-item.active .nav-icon-box {
		background: var(--md-sys-color-primary-container);
	}

	.nav-icon {
		width: 1.125rem;
		height: 1.125rem;
	}

	.nav-item.active .nav-icon {
		color: var(--md-sys-color-on-primary-container);
	}

	.nav-label {
		flex: 1;
		font: var(--md-sys-typescale-label-large);
	}

	.nav-chevron {
		width: 1rem;
		height: 1rem;
		opacity: 0.4;
		flex-shrink: 0;
	}

	/* ---- Separator ---- */
	.nav-separator {
		height: 1px;
		margin: 0 1.25rem;
		background: var(--md-sys-color-outline-variant);
	}

	/* ---- Bottom ---- */
	.nav-bottom {
		padding: 1rem 0.75rem 1.5rem;
	}

	/* -- User card -- */
	.user-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem;
		border-radius: var(--md-sys-shape-corner-large);
		background: var(--md-sys-color-surface-container);
		border: none;
		cursor: pointer;
		color: var(--md-sys-color-on-surface);
		transition: background-color 150ms ease;
	}

	.user-card:hover {
		background: var(--md-sys-color-surface-container-high);
	}

	.user-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: var(--md-sys-color-primary);
		flex-shrink: 0;
	}

	.user-initial {
		font: var(--md-sys-typescale-label-large);
		color: var(--md-sys-color-on-primary);
	}

	.user-info {
		flex: 1;
		min-width: 0;
		text-align: left;
	}

	.user-email {
		font: var(--md-sys-typescale-body-medium);
		color: var(--md-sys-color-on-surface);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
	}

	.user-chevron {
		width: 1rem;
		height: 1rem;
		color: var(--md-sys-color-on-surface-variant);
		opacity: 0.5;
		flex-shrink: 0;
	}

	/* -- Sign in button -- */
	.sign-in-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border-radius: var(--md-sys-shape-corner-large);
		background: var(--md-sys-color-surface-container);
		border: 1px solid var(--md-sys-color-primary);
		cursor: pointer;
		color: var(--md-sys-color-on-surface);
		transition: background-color 150ms ease;
	}

	.sign-in-btn:hover {
		background: var(--md-sys-color-surface-container-high);
	}

	.sign-in-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--md-sys-color-primary);
		flex-shrink: 0;
	}

	.sign-in-label {
		font: var(--md-sys-typescale-label-large);
	}
</style>
