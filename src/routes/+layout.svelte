<script lang="ts">
	import '../app.css';
	import ShopShell from '$lib/components/layout/ShopShell.svelte';
	import { initTenantContext } from '$lib/stores/tenant.svelte.js';
	import { cart } from '$lib/stores/cart.svelte.js';
	import { orderStore } from '$lib/stores/orders.svelte.js';
	import { addressStore } from '$lib/stores/addresses.svelte.js';
	import { memberOrdersStore } from '$lib/stores/memberOrders.svelte.js';
	import BudyLogoSplash from '$lib/components/shared/BudyLogoSplash.svelte';
	import InstallPrompt from '$lib/components/shared/InstallPrompt.svelte';
	import NotificationPrompt from '$lib/components/NotificationPrompt.svelte';
	import { pwa } from '$lib/stores/pwa.svelte.js';
	import { notifications, type FcmPayload } from '$lib/stores/notifications.svelte.js';
	import { toastStore } from '$lib/stores/toast.svelte.js';
	import ToastContainer from '$lib/components/shared/ToastContainer.svelte';
	import { fade } from 'svelte/transition';

	let { data, children } = $props();

	const tenantCtx = initTenantContext();

	$effect(() => {
		tenantCtx.set(data.tenant);
	});

	$effect(() => {
		if (data.tenant) {
			cart.initPersistence(data.tenant.id);
			orderStore.initPersistence(data.tenant.id);
		}
	});

	$effect(() => {
		if (data.user) {
			addressStore.loadProfile();
			addressStore.load();
		} else {
			addressStore.clear();
			memberOrdersStore.clear();
		}
	});

	const tenant = $derived(data.tenant);

	$effect(() => {
		if (data.tenant && data.user) {
			notifications.init();
		}
	});

	function handleForegroundMessage(payload: FcmPayload) {
		const type = payload.data?.type;
		const orderId = payload.data?.orderId;

		if (type === 'order_status_changed' && orderId) {
			const statusValue = parseInt(payload.data?.status ?? '', 10);
			const statusName = payload.data?.statusName ?? '';
			const deliveryStatus = payload.data?.deliveryStatus
				? parseInt(payload.data.deliveryStatus, 10)
				: undefined;
			const deliveryStatusName = payload.data?.deliveryStatusName;

			memberOrdersStore.updateOrderStatus(
				orderId,
				statusValue,
				statusName,
				deliveryStatus,
				deliveryStatusName
			);
		}

		const title = payload.notification?.title ?? 'Order Update';
		const body = payload.notification?.body;
		toastStore.show(title, body);
	}

	$effect(() => {
		if (data.tenant && data.user && notifications.isSubscribed) {
			notifications.listenForeground(handleForegroundMessage);
		}
	});

	$effect(() => {
		const onPrompt = (e: Event) => pwa.capturePrompt(e as BeforeInstallPromptEvent);
		const onInstalled = () => pwa.markInstalled();
		window.addEventListener('beforeinstallprompt', onPrompt);
		window.addEventListener('appinstalled', onInstalled);
		return () => {
			window.removeEventListener('beforeinstallprompt', onPrompt);
			window.removeEventListener('appinstalled', onInstalled);
		};
	});

	let showSplash = $state(true);

	function handleSplashComplete() {
		setTimeout(() => {
			showSplash = false;
		}, 400);
	}
</script>

<svelte:head>
	<title>{tenant?.name ?? 'Shop'} | Budy</title>
	<meta name="description" content="{tenant?.name ?? 'Shop'} - Browse products and order online" />
	<link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

{#if showSplash && tenant}
	<div
		class="fixed inset-0 z-50 flex flex-col items-center justify-center"
		style="background: var(--md-sys-color-surface)"
		out:fade={{ duration: 300 }}
	>
		<BudyLogoSplash size={240} onanimationend={handleSplashComplete} />
		<p
			class="splash-name mt-8 text-4xl font-medium"
			style="color: var(--md-sys-color-on-surface)"
		>
			{tenant.name}
		</p>
	</div>
{/if}

{#if tenant}
	<ShopShell>
		{@render children()}
	</ShopShell>
	<InstallPrompt />
	<ToastContainer />
	{#if data.user}
		<NotificationPrompt memberId={data.user.id} />
	{/if}
{:else}
	<div class="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
		<div class="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container)]">
			<svg class="h-8 w-8 text-[var(--md-sys-color-outline)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
			</svg>
		</div>
		<h1 class="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">Shop Not Found</h1>
		<p class="max-w-sm text-sm text-[var(--md-sys-color-outline)]">
			This shop doesn't exist or is not available. Please check the URL and try again.
		</p>
	</div>
{/if}

<style>
	.splash-name {
		opacity: 0;
		animation: splash-fade-in 400ms ease 600ms forwards;
	}

	@keyframes splash-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
