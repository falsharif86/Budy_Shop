<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount, untrack } from 'svelte';
	import type { MemberAddress, CreateAddressPayload, AddressLabel } from '$lib/types/address.js';
	import {
		loadGoogleMaps,
		initAutocomplete,
		initMap,
		addDraggableMarker,
		reverseGeocode,
		panTo,
		DEFAULT_CENTER,
		DEFAULT_ZOOM,
		type PlaceResult
	} from '$lib/utils/google-maps.js';
	import { IconChevronLeft, IconMapPin } from '$lib/components/icons/index.js';

	interface Props {
		editAddress?: MemberAddress | null;
		onsave: (payload: CreateAddressPayload) => void;
		oncancel: () => void;
	}

	let { editAddress = null, onsave, oncancel }: Props = $props();

	const isEdit = $derived(!!editAddress);
	const apiKey = env.PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
	const hasGoogleMaps = apiKey.length > 0;

	// Snapshot initial values from prop for form initialization
	const initial = untrack(() => editAddress);
	const initialStep: 'search' | 'details' = initial ? 'details' : hasGoogleMaps ? 'search' : 'details';

	// Form state
	let step = $state<'search' | 'details'>(initialStep);
	let streetAddress = $state(initial?.streetAddress ?? '');
	let houseNumber = $state(initial?.houseNumber ?? '');
	let apartment = $state('');
	let floor = $state(initial?.floor ?? '');
	let building = $state(initial?.building ?? '');
	let city = $state(initial?.city ?? '');
	let postalCode = $state(initial?.postalCode ?? '');
	let country = $state(initial?.country ?? '');
	let latitude = $state<number | null>(initial?.latitude ?? null);
	let longitude = $state<number | null>(initial?.longitude ?? null);
	let placeId = $state<string | null>(initial?.placeId ?? null);
	let label = $state<AddressLabel>(initial?.label ?? 'Home');
	let isDefault = $state(initial?.isDefault ?? false);
	let formattedAddress = $state('');

	let searchInput = $state<HTMLInputElement | null>(null);
	let mapContainer = $state<HTMLElement | null>(null);
	let mapsLoaded = $state(false);
	let mapLoadError = $state(false);
	let reversing = $state(false);
	let saving = $state(false);
	let detailsOpen = $state(false);

	// Map instances (not reactive)
	let mapInstance: any = null;
	let markerInstance: any = null;

	const hasLocation = $derived(latitude !== null && longitude !== null);
	const canConfirm = $derived(hasLocation || formattedAddress.length > 0);
	const canSave = $derived(streetAddress.trim().length > 0 && city.trim().length > 0);

	const staticMapUrl = $derived.by(() => {
		if (!apiKey || !latitude || !longitude) return '';
		return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=17&size=640x240&scale=2&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
	});

	onMount(() => {
		if (!hasGoogleMaps) return;

		loadGoogleMaps(apiKey)
			.then(() => {
				mapsLoaded = true;
				if (step === 'search') {
					requestAnimationFrame(() => initSearchMap());
				}
			})
			.catch(() => {
				mapLoadError = true;
				step = 'details';
			});
	});

	function initSearchMap() {
		// Init autocomplete
		const el = searchInput;
		if (el) {
			initAutocomplete(el, handlePlaceSelect);
		}

		// Init map
		const container = mapContainer;
		if (!container) return;

		const startLat = latitude ?? DEFAULT_CENTER.lat;
		const startLng = longitude ?? DEFAULT_CENTER.lng;
		const startZoom = latitude ? 17 : DEFAULT_ZOOM;

		mapInstance = initMap(container, startLat, startLng, startZoom);
		markerInstance = addDraggableMarker(mapInstance, startLat, startLng, handleMarkerDrag);

		// Try browser geolocation if no existing coordinates
		if (!latitude && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const lat = pos.coords.latitude;
					const lng = pos.coords.longitude;
					panTo(mapInstance, lat, lng, markerInstance);
					mapInstance.setZoom(17);
				},
				() => {
					// Ignore - keep Amsterdam default
				},
				{ timeout: 5000 }
			);
		}
	}

	function handlePlaceSelect(place: PlaceResult) {
		streetAddress = place.streetAddress;
		houseNumber = place.houseNumber ?? '';
		city = place.city;
		postalCode = place.postalCode ?? '';
		country = place.country;
		latitude = place.latitude;
		longitude = place.longitude;
		placeId = place.placeId;
		formattedAddress = place.formattedAddress;

		// Pan map and marker to selected place
		if (mapInstance && place.latitude && place.longitude) {
			panTo(mapInstance, place.latitude, place.longitude, markerInstance);
			mapInstance.setZoom(17);
		}
	}

	async function handleMarkerDrag(lat: number, lng: number) {
		latitude = lat;
		longitude = lng;
		reversing = true;

		const result = await reverseGeocode(lat, lng);
		reversing = false;

		if (result) {
			streetAddress = result.streetAddress;
			houseNumber = result.houseNumber ?? '';
			city = result.city;
			postalCode = result.postalCode ?? '';
			country = result.country;
			placeId = result.placeId;
			formattedAddress = result.formattedAddress;
		}
	}

	function confirmLocation() {
		step = 'details';
	}

	function backToSearch() {
		step = 'search';
		// Re-init map after DOM update
		requestAnimationFrame(() => {
			requestAnimationFrame(() => initSearchMap());
		});
	}

	function skipToManual() {
		step = 'details';
	}

	function handleSubmit() {
		if (!canSave || saving) return;
		saving = true;

		// Combine apartment into houseNumber if provided
		const finalHouseNumber = apartment.trim()
			? houseNumber.trim()
				? `${houseNumber.trim()}, ${apartment.trim()}`
				: apartment.trim()
			: houseNumber.trim() || null;

		const payload: CreateAddressPayload = {
			label,
			streetAddress: streetAddress.trim(),
			houseNumber: finalHouseNumber,
			floor: floor.trim() || null,
			building: building.trim() || null,
			city: city.trim(),
			postalCode: postalCode.trim() || null,
			country: country.trim(),
			latitude,
			longitude,
			placeId,
			isDefault
		};
		onsave(payload);
	}

	// Build display address for preview
	const displayAddress = $derived.by(() => {
		if (formattedAddress) return formattedAddress;
		const parts = [streetAddress, houseNumber, city].filter(Boolean);
		return parts.join(', ') || '';
	});
</script>

<div class="af">
	<!-- Header -->
	<div class="af__header">
		<button
			class="af__back"
			onclick={step === 'details' && !isEdit && hasGoogleMaps && !mapLoadError ? backToSearch : oncancel}
			aria-label="Back"
		>
			<IconChevronLeft class="af__back-icon" />
		</button>
		<h3 class="af__title">
			{#if step === 'search'}
				Select Location
			{:else}
				{isEdit ? 'Edit Address' : 'Address Details'}
			{/if}
		</h3>
		<div class="af__spacer"></div>
	</div>

	<div class="af__content">
		{#if step === 'search'}
			<!-- Step 1: Search + Map -->
			<div class="af__search-section">
				<!-- Search bar -->
				<div class="af__search-wrap">
					<svg class="af__search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
					<input
						bind:this={searchInput}
						class="af__search-input"
						type="text"
						placeholder="Search address..."
						disabled={!mapsLoaded}
					/>
				</div>

				<!-- Map -->
				<div class="af__map-area">
					<div bind:this={mapContainer} class="af__map"></div>

					<!-- Reversing badge -->
					{#if reversing}
						<div class="af__reversing-badge">
							<div class="af__reversing-dot"></div>
							Finding address...
						</div>
					{/if}
				</div>

				<!-- Address preview -->
				{#if displayAddress && !reversing}
					<div class="af__address-preview">
						<IconMapPin class="af__preview-pin" />
						<span class="af__preview-text">{displayAddress}</span>
					</div>
				{/if}

				<!-- Manual fallback -->
				<button class="af__manual-btn" onclick={skipToManual}>
					Enter address manually
				</button>

				<!-- Confirm button -->
				<button
					class="af__confirm-btn"
					class:af__confirm-btn--enabled={canConfirm}
					disabled={!canConfirm}
					onclick={confirmLocation}
					type="button"
				>
					Confirm Location
				</button>
			</div>
		{:else}
			<!-- Step 2: Address Details -->
			<div class="af__details-section">
				<!-- Static map + address summary -->
				{#if staticMapUrl}
					<div class="af__static-map-card">
						<img class="af__static-map" src={staticMapUrl} alt="Selected location" loading="lazy" />
						<div class="af__static-map-overlay">
							<IconMapPin class="af__static-pin" />
							<span class="af__static-address">{displayAddress}</span>
						</div>
					</div>
				{:else if displayAddress}
					<div class="af__address-summary">
						<IconMapPin class="af__summary-pin" />
						<span class="af__summary-text">{displayAddress}</span>
					</div>
				{/if}

				<!-- Apartment / Unit - PROMINENT -->
				<div class="af__field af__field--prominent">
					<label class="af__field-label" for="af-apartment">Apartment / Unit number</label>
					<input
						id="af-apartment"
						class="af__input af__input--prominent"
						type="text"
						bind:value={apartment}
						placeholder="e.g. Apt 4B, Unit 12"
					/>
				</div>

				<!-- Floor + Building row -->
				<div class="af__row">
					<div class="af__field">
						<label class="af__field-label" for="af-floor">Floor</label>
						<input id="af-floor" class="af__input" type="text" bind:value={floor} placeholder="e.g. 2nd" />
					</div>
					<div class="af__field">
						<label class="af__field-label" for="af-building">Building</label>
						<input id="af-building" class="af__input" type="text" bind:value={building} placeholder="e.g. Block A" />
					</div>
				</div>

				<!-- Label chips -->
				<div class="af__label-group">
					{#each ['Home', 'Work', 'Other'] as opt}
						<button
							class="af__label-chip"
							class:af__label-chip--active={label === opt}
							onclick={() => (label = opt as AddressLabel)}
							type="button"
						>
							{opt}
						</button>
					{/each}
				</div>

				<!-- Collapsible address details -->
				<details class="af__edit-details" bind:open={detailsOpen}>
					<summary class="af__edit-summary">
						{detailsOpen ? '- Hide' : '+ Edit'} address details
					</summary>
					<div class="af__edit-fields">
						<div class="af__row">
							<div class="af__field af__field--grow">
								<label class="af__field-label" for="af-street">
									Street <span class="af__required">*</span>
								</label>
								<input id="af-street" class="af__input" type="text" bind:value={streetAddress} placeholder="Street name" />
							</div>
							<div class="af__field af__field--small">
								<label class="af__field-label" for="af-number">No.</label>
								<input id="af-number" class="af__input" type="text" bind:value={houseNumber} placeholder="123" />
							</div>
						</div>
						<div class="af__row">
							<div class="af__field af__field--grow">
								<label class="af__field-label" for="af-city">
									City <span class="af__required">*</span>
								</label>
								<input id="af-city" class="af__input" type="text" bind:value={city} placeholder="City" />
							</div>
							<div class="af__field af__field--small">
								<label class="af__field-label" for="af-postal">Postal</label>
								<input id="af-postal" class="af__input" type="text" bind:value={postalCode} placeholder="1234 AB" />
							</div>
						</div>
						<div class="af__field">
							<label class="af__field-label" for="af-country">Country</label>
							<input id="af-country" class="af__input" type="text" bind:value={country} placeholder="Country" />
						</div>
					</div>
				</details>

				<!-- Default toggle -->
				<label class="af__toggle">
					<input type="checkbox" bind:checked={isDefault} class="af__checkbox" />
					<span class="af__toggle-label">Set as default address</span>
				</label>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	{#if step === 'details'}
		<div class="af__footer">
			<button class="af__cancel-btn" onclick={oncancel} type="button">Cancel</button>
			<button
				class="af__save-btn"
				class:af__save-btn--enabled={canSave}
				disabled={!canSave || saving}
				onclick={handleSubmit}
				type="button"
			>
				{#if saving}
					Saving...
				{:else}
					{isEdit ? 'Update' : 'Save Address'}
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	/* Autocomplete dropdown z-index fix for drawer */
	:global(.pac-container) {
		z-index: 99999 !important;
	}

	.af {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	/* Header */
	.af__header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 16px 20px;
		border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.af__back {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 9999px;
		transition: background-color 0.15s ease;
	}

	.af__back:hover {
		background: var(--md-sys-color-surface-container);
	}

	:global(.af__back-icon) {
		width: 20px;
		height: 20px;
		color: var(--md-sys-color-on-surface);
	}

	.af__title {
		flex: 1;
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.af__spacer {
		width: 36px;
	}

	/* Content */
	.af__content {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	/* Step 1: Search */
	.af__search-section {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 12px 16px 16px;
		gap: 12px;
	}

	.af__search-wrap {
		position: relative;
	}

	.af__search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		width: 18px;
		height: 18px;
		color: var(--md-sys-color-outline);
		pointer-events: none;
	}

	.af__search-input {
		width: 100%;
		padding: 12px 14px 12px 38px;
		border-radius: 12px;
		border: 1.5px solid var(--md-sys-color-outline-variant);
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);
		font-size: 0.875rem;
		font-family: inherit;
		box-sizing: border-box;
		transition: border-color 150ms ease;
	}

	.af__search-input:focus {
		outline: none;
		border-color: var(--md-sys-color-primary);
	}

	/* Map area */
	.af__map-area {
		position: relative;
		flex: 1;
		min-height: 220px;
		border-radius: 16px;
		overflow: hidden;
		border: 1.5px solid var(--md-sys-color-outline-variant);
	}

	.af__map {
		width: 100%;
		height: 100%;
	}

	.af__reversing-badge {
		position: absolute;
		top: 12px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		border-radius: 9999px;
		background: var(--md-sys-color-surface);
		color: var(--md-sys-color-on-surface);
		font-size: 0.75rem;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		white-space: nowrap;
		z-index: 1;
	}

	.af__reversing-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--md-sys-color-primary);
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	/* Address preview bar */
	.af__address-preview {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		border-radius: 12px;
		background: var(--md-sys-color-surface-container);
		border: 1.5px solid var(--md-sys-color-outline-variant);
	}

	:global(.af__preview-pin) {
		width: 18px;
		height: 18px;
		color: var(--md-sys-color-primary);
		flex-shrink: 0;
	}

	.af__preview-text {
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Manual fallback */
	.af__manual-btn {
		align-self: flex-start;
		padding: 6px 12px;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--md-sys-color-primary);
		background: transparent;
		transition: background-color 150ms ease;
	}

	.af__manual-btn:hover {
		background: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
	}

	/* Confirm location button */
	.af__confirm-btn {
		width: 100%;
		height: 48px;
		border-radius: 12px;
		font-size: 0.9375rem;
		font-weight: 600;
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-outline);
		opacity: 0.6;
		transition: all 150ms ease;
	}

	.af__confirm-btn:disabled {
		cursor: not-allowed;
	}

	.af__confirm-btn--enabled {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		opacity: 1;
		box-shadow: 0 4px 12px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
	}

	.af__confirm-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	/* Step 2: Details */
	.af__details-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
	}

	/* Static map card */
	.af__static-map-card {
		position: relative;
		border-radius: 14px;
		overflow: hidden;
		border: 1.5px solid var(--md-sys-color-outline-variant);
	}

	.af__static-map {
		width: 100%;
		height: 120px;
		object-fit: cover;
		display: block;
	}

	.af__static-map-overlay {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: var(--md-sys-color-surface-container);
	}

	:global(.af__static-pin) {
		width: 16px;
		height: 16px;
		color: var(--md-sys-color-primary);
		flex-shrink: 0;
	}

	.af__static-address {
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Address summary (no static map fallback) */
	.af__address-summary {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border-radius: 12px;
		background: var(--md-sys-color-surface-container);
		border: 1.5px solid var(--md-sys-color-outline-variant);
	}

	:global(.af__summary-pin) {
		width: 18px;
		height: 18px;
		color: var(--md-sys-color-primary);
		flex-shrink: 0;
	}

	.af__summary-text {
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface);
	}

	/* Prominent field */
	.af__field--prominent {
		margin: 0;
	}

	.af__input--prominent {
		padding: 14px 14px;
		border-color: var(--md-sys-color-primary);
		background: color-mix(in srgb, var(--md-sys-color-primary-container) 15%, var(--md-sys-color-surface-container));
		font-size: 0.9375rem;
	}

	.af__input--prominent::placeholder {
		color: var(--md-sys-color-outline);
	}

	/* Fields */
	.af__field {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.af__field--grow {
		flex: 2;
	}

	.af__field--small {
		flex: 0 0 80px;
	}

	.af__field-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
	}

	.af__required {
		color: var(--md-sys-color-error);
	}

	.af__input {
		padding: 10px 12px;
		border-radius: 10px;
		border: 1.5px solid var(--md-sys-color-outline-variant);
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);
		font-size: 0.875rem;
		font-family: inherit;
		box-sizing: border-box;
		transition: border-color 150ms ease;
	}

	.af__input:focus {
		outline: none;
		border-color: var(--md-sys-color-primary);
	}

	.af__row {
		display: flex;
		gap: 10px;
	}

	/* Label chips */
	.af__label-group {
		display: flex;
		gap: 8px;
	}

	.af__label-chip {
		padding: 6px 16px;
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 500;
		border: 1.5px solid var(--md-sys-color-outline-variant);
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface-variant);
		transition: all 150ms ease;
		cursor: pointer;
	}

	.af__label-chip:hover {
		border-color: var(--md-sys-color-outline);
	}

	.af__label-chip--active {
		border-color: var(--md-sys-color-primary);
		background: color-mix(in srgb, var(--md-sys-color-primary-container) 40%, transparent);
		color: var(--md-sys-color-primary);
	}

	/* Collapsible edit details */
	.af__edit-details {
		border-radius: 10px;
	}

	.af__edit-summary {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--md-sys-color-primary);
		cursor: pointer;
		padding: 4px 0;
		list-style: none;
		user-select: none;
	}

	.af__edit-summary::-webkit-details-marker {
		display: none;
	}

	.af__edit-summary::marker {
		content: '';
	}

	.af__edit-fields {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding-top: 12px;
	}

	/* Toggle */
	.af__toggle {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 4px 0;
		cursor: pointer;
	}

	.af__checkbox {
		width: 18px;
		height: 18px;
		accent-color: var(--md-sys-color-primary);
	}

	.af__toggle-label {
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface-variant);
	}

	/* Footer */
	.af__footer {
		display: flex;
		gap: 10px;
		padding: 12px 16px 24px;
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.af__cancel-btn {
		flex: 1;
		height: 48px;
		border-radius: 12px;
		font-size: 0.9375rem;
		font-weight: 500;
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-on-surface);
		border: 1px solid var(--md-sys-color-outline-variant);
		transition: transform 0.1s ease;
	}

	.af__cancel-btn:active {
		transform: scale(0.98);
	}

	.af__save-btn {
		flex: 1;
		height: 48px;
		border-radius: 12px;
		font-size: 0.9375rem;
		font-weight: 500;
		background: var(--md-sys-color-surface-container);
		color: var(--md-sys-color-outline);
		opacity: 0.6;
		transition: transform 0.1s ease;
	}

	.af__save-btn:disabled {
		cursor: not-allowed;
	}

	.af__save-btn--enabled {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		opacity: 1;
		box-shadow: 0 4px 12px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
	}

	.af__save-btn:active:not(:disabled) {
		transform: scale(0.98);
	}
</style>
