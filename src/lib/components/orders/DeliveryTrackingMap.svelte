<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import {
		loadGoogleMaps,
		initMap,
		addMarker,
		drawRoute,
		fitBounds,
		haversineDistance,
		estimateDeliveryMinutes,
		DARK_MAP_STYLES
	} from '$lib/utils/google-maps.js';

	interface Props {
		deliveryLat: number;
		deliveryLng: number;
		children: import('svelte').Snippet;
	}

	let { deliveryLat, deliveryLng, children }: Props = $props();

	const apiKey = env.PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

	let mapContainer = $state<HTMLElement>(null!);
	let loading = $state(true);
	let shopLat = $state<number | null>(null);
	let shopLng = $state<number | null>(null);
	let mapReady = $state(false);

	// Sheet drag state
	let sheetEl = $state<HTMLElement>(null!);
	let dragging = $state(false);
	let sheetY = $state(0); // 0 = collapsed (sheet up), 1 = expanded (sheet down, map visible)
	let startY = 0;
	let startSheetY = 0;

	const distanceKm = $derived(
		shopLat != null && shopLng != null
			? haversineDistance(shopLat, shopLng, deliveryLat, deliveryLng)
			: null
	);
	const etaMinutes = $derived(distanceKm != null ? estimateDeliveryMinutes(distanceKm) : null);

	const distanceLabel = $derived(
		distanceKm != null
			? distanceKm < 1
				? `~${Math.round(distanceKm * 1000)} m`
				: `~${distanceKm.toFixed(1)} km`
			: null
	);

	onMount(() => {
		if (!apiKey) {
			loading = false;
			return;
		}

		Promise.all([fetchShopCoordinates(), loadGoogleMaps(apiKey)])
			.then(([coords]) => {
				if (coords?.latitude != null && coords?.longitude != null) {
					shopLat = coords.latitude;
					shopLng = coords.longitude;
					initDeliveryMap();
				}
			})
			.catch(() => {})
			.finally(() => {
				loading = false;
			});
	});

	async function fetchShopCoordinates(): Promise<{
		latitude: number | null;
		longitude: number | null;
	} | null> {
		try {
			const res = await fetch('/api/tenant/coordinates');
			if (!res.ok) return null;
			return await res.json();
		} catch {
			return null;
		}
	}

	function initDeliveryMap() {
		if (!mapContainer || shopLat == null || shopLng == null) return;

		const midLat = (shopLat + deliveryLat) / 2;
		const midLng = (shopLng + deliveryLng) / 2;

		const map = initMap(mapContainer, midLat, midLng, 13, DARK_MAP_STYLES);

		// Shop marker (green)
		addMarker(map, shopLat, shopLng, {
			icon: {
				path: 0, // google.maps.SymbolPath.CIRCLE
				scale: 8,
				fillColor: '#00C896',
				fillOpacity: 1,
				strokeColor: '#ffffff',
				strokeWeight: 2
			}
		});

		// Delivery marker (white)
		addMarker(map, deliveryLat, deliveryLng, {
			icon: {
				path: 0,
				scale: 8,
				fillColor: '#ffffff',
				fillOpacity: 1,
				strokeColor: '#00C896',
				strokeWeight: 2
			}
		});

		drawRoute(map, { lat: shopLat, lng: shopLng }, { lat: deliveryLat, lng: deliveryLng });

		fitBounds(map, [
			{ lat: shopLat, lng: shopLng },
			{ lat: deliveryLat, lng: deliveryLng }
		]);

		mapReady = true;
	}

	// --- Sheet drag handlers ---
	function onHandlePointerDown(e: PointerEvent) {
		dragging = true;
		startY = e.clientY;
		startSheetY = sheetY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onHandlePointerMove(e: PointerEvent) {
		if (!dragging || !sheetEl) return;
		const containerHeight = sheetEl.parentElement?.clientHeight ?? 1;
		const mapArea = containerHeight * 0.55; // max map reveal area
		const delta = e.clientY - startY;
		const normalized = startSheetY + delta / mapArea;
		sheetY = Math.max(0, Math.min(1, normalized));
	}

	function onHandlePointerUp() {
		if (!dragging) return;
		dragging = false;
		// Snap to nearest
		sheetY = sheetY > 0.4 ? 1 : 0;
	}
</script>

<div class="delivery-tracking">
	{#if loading}
		<div class="delivery-tracking__loader">
			<div class="delivery-tracking__spinner"></div>
		</div>
		{@render children()}
	{:else if !apiKey || shopLat == null || shopLng == null}
		{@render children()}
	{:else}
		<!-- Map layer (fixed behind sheet) -->
		<div class="delivery-tracking__map" bind:this={mapContainer}></div>

		<!-- Distance/ETA chip -->
		{#if mapReady && distanceLabel}
			<div
				class="delivery-tracking__info-chip"
				style="opacity: {sheetY > 0.2 ? 1 : 0};"
			>
				{distanceLabel} &middot; ~{etaMinutes} min
			</div>
		{/if}

		<!-- Draggable bottom sheet -->
		<div
			class="delivery-tracking__sheet"
			class:delivery-tracking__sheet--animating={!dragging}
			bind:this={sheetEl}
			style="transform: translateY({sheetY * 55}%);"
		>
			<div
				class="delivery-tracking__sheet-handle"
				role="slider"
				tabindex="0"
				aria-label="Drag to reveal map"
				aria-valuenow={Math.round(sheetY * 100)}
				aria-valuemin={0}
				aria-valuemax={100}
				onpointerdown={onHandlePointerDown}
				onpointermove={onHandlePointerMove}
				onpointerup={onHandlePointerUp}
				onpointercancel={onHandlePointerUp}
			>
				<div class="delivery-tracking__sheet-bar"></div>
			</div>
			<div class="delivery-tracking__sheet-content">
				{@render children()}
			</div>
		</div>
	{/if}
</div>

<style>
	.delivery-tracking {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
	}

	.delivery-tracking__loader {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.delivery-tracking__spinner {
		width: 24px;
		height: 24px;
		border: 3px solid var(--md-sys-color-surface-container-high);
		border-top-color: var(--md-sys-color-primary);
		border-radius: 50%;
		animation: dt-spin 0.7s linear infinite;
	}

	@keyframes dt-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.delivery-tracking__map {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.delivery-tracking__info-chip {
		position: absolute;
		top: 12px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
		padding: 6px 14px;
		border-radius: 9999px;
		background: color-mix(in srgb, var(--md-sys-color-surface) 90%, transparent);
		color: var(--md-sys-color-on-surface);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		transition: opacity 0.25s ease;
		pointer-events: none;
		white-space: nowrap;
	}

	.delivery-tracking__sheet {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		background: var(--md-sys-color-surface);
		border-radius: 18px 18px 0 0;
		will-change: transform;
	}

	.delivery-tracking__sheet--animating {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.delivery-tracking__sheet-handle {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px 0 6px;
		cursor: grab;
		touch-action: none;
		flex-shrink: 0;
	}

	.delivery-tracking__sheet-handle:active {
		cursor: grabbing;
	}

	.delivery-tracking__sheet-bar {
		width: 36px;
		height: 4px;
		border-radius: 2px;
		background: var(--md-sys-color-outline-variant);
	}

	.delivery-tracking__sheet-content {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
</style>
