<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount, untrack } from 'svelte';
	import type { MemberAddress, CreateAddressPayload, AddressLabel } from '$lib/types/address.js';
	import { loadGoogleMaps, initAutocomplete, type PlaceResult } from '$lib/utils/google-maps.js';
	import { IconChevronLeft } from '$lib/components/icons/index.js';

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
	const initialStep: 'search' | 'details' = initial ? 'details' : (hasGoogleMaps ? 'search' : 'details');

	// Form state
	let step = $state<'search' | 'details'>(initialStep);
	let streetAddress = $state(initial?.streetAddress ?? '');
	let houseNumber = $state(initial?.houseNumber ?? '');
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

	let searchInput = $state<HTMLInputElement | null>(null);
	let mapsLoaded = $state(false);
	let saving = $state(false);

	const canSave = $derived(streetAddress.trim().length > 0 && city.trim().length > 0);

	onMount(() => {
		if (hasGoogleMaps && step === 'search') {
			loadGoogleMaps(apiKey)
				.then(() => {
					mapsLoaded = true;
					const el = searchInput;
					if (el) {
						initAutocomplete(el, handlePlaceSelect);
					}
				})
				.catch(() => {
					// Fall back to manual entry
					step = 'details';
				});
		}
	});

	function handlePlaceSelect(place: PlaceResult) {
		streetAddress = place.streetAddress;
		houseNumber = place.houseNumber ?? '';
		city = place.city;
		postalCode = place.postalCode ?? '';
		country = place.country;
		latitude = place.latitude;
		longitude = place.longitude;
		placeId = place.placeId;
		step = 'details';
	}

	function skipToManual() {
		step = 'details';
	}

	function handleSubmit() {
		if (!canSave || saving) return;
		saving = true;
		const payload: CreateAddressPayload = {
			label,
			streetAddress: streetAddress.trim(),
			houseNumber: houseNumber.trim() || null,
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
</script>

<div class="address-form">
	<!-- Header -->
	<div class="address-form__header">
		<button class="address-form__back" onclick={oncancel} aria-label="Back">
			<IconChevronLeft class="address-form__back-icon" />
		</button>
		<h3 class="address-form__title">{isEdit ? 'Edit Address' : 'New Address'}</h3>
		<div class="address-form__spacer"></div>
	</div>

	<div class="address-form__content">
		{#if step === 'search'}
			<!-- Search step -->
			<div class="address-form__section">
				<p class="address-form__hint">Search for your address or enter it manually.</p>
				<div class="address-form__search-wrap">
					<svg class="address-form__search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
					<input
						bind:this={searchInput}
						class="address-form__search-input"
						type="text"
						placeholder="Start typing an address..."
						disabled={!mapsLoaded}
					/>
				</div>
				<button class="address-form__manual-btn" onclick={skipToManual}>
					Enter address manually
				</button>
			</div>
		{:else}
			<!-- Details step -->
			<div class="address-form__section">
				<!-- Label selector -->
				<div class="address-form__label-group">
					{#each ['Home', 'Work', 'Other'] as opt}
						<button
							class="address-form__label-chip"
							class:address-form__label-chip--active={label === opt}
							onclick={() => (label = opt as AddressLabel)}
							type="button"
						>
							{opt}
						</button>
					{/each}
				</div>

				<!-- Address fields -->
				<div class="address-form__fields">
					<div class="address-form__row">
						<div class="address-form__field address-form__field--grow">
							<label class="address-form__field-label" for="af-street">
								Street <span class="address-form__required">*</span>
							</label>
							<input id="af-street" class="address-form__input" type="text" bind:value={streetAddress} placeholder="Street name" />
						</div>
						<div class="address-form__field address-form__field--small">
							<label class="address-form__field-label" for="af-number">No.</label>
							<input id="af-number" class="address-form__input" type="text" bind:value={houseNumber} placeholder="123" />
						</div>
					</div>

					<div class="address-form__row">
						<div class="address-form__field">
							<label class="address-form__field-label" for="af-floor">Floor</label>
							<input id="af-floor" class="address-form__input" type="text" bind:value={floor} placeholder="e.g. 2nd" />
						</div>
						<div class="address-form__field">
							<label class="address-form__field-label" for="af-building">Building</label>
							<input id="af-building" class="address-form__input" type="text" bind:value={building} placeholder="e.g. Block A" />
						</div>
					</div>

					<div class="address-form__row">
						<div class="address-form__field address-form__field--grow">
							<label class="address-form__field-label" for="af-city">
								City <span class="address-form__required">*</span>
							</label>
							<input id="af-city" class="address-form__input" type="text" bind:value={city} placeholder="City" />
						</div>
						<div class="address-form__field address-form__field--small">
							<label class="address-form__field-label" for="af-postal">Postal</label>
							<input id="af-postal" class="address-form__input" type="text" bind:value={postalCode} placeholder="1234 AB" />
						</div>
					</div>

					<div class="address-form__field">
						<label class="address-form__field-label" for="af-country">Country</label>
						<input id="af-country" class="address-form__input" type="text" bind:value={country} placeholder="Country" />
					</div>

					<!-- Default toggle -->
					<label class="address-form__toggle">
						<input type="checkbox" bind:checked={isDefault} class="address-form__checkbox" />
						<span class="address-form__toggle-label">Set as default address</span>
					</label>
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	{#if step === 'details'}
		<div class="address-form__footer">
			<button class="address-form__cancel-btn" onclick={oncancel} type="button">Cancel</button>
			<button
				class="address-form__save-btn"
				class:address-form__save-btn--enabled={canSave}
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
	.address-form {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.address-form__header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 16px 20px;
		border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.address-form__back {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 9999px;
		transition: background-color 0.15s ease;
	}

	.address-form__back:hover {
		background: var(--md-sys-color-surface-container);
	}

	:global(.address-form__back-icon) {
		width: 20px;
		height: 20px;
		color: var(--md-sys-color-on-surface);
	}

	.address-form__title {
		flex: 1;
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.address-form__spacer {
		width: 36px;
	}

	.address-form__content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.address-form__section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.address-form__hint {
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}

	/* Search */
	.address-form__search-wrap {
		position: relative;
	}

	.address-form__search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		width: 18px;
		height: 18px;
		color: var(--md-sys-color-outline);
		pointer-events: none;
	}

	.address-form__search-input {
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

	.address-form__search-input:focus {
		outline: none;
		border-color: var(--md-sys-color-primary);
	}

	.address-form__manual-btn {
		align-self: flex-start;
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--md-sys-color-primary);
		background: transparent;
		transition: background-color 150ms ease;
	}

	.address-form__manual-btn:hover {
		background: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
	}

	/* Label chips */
	.address-form__label-group {
		display: flex;
		gap: 8px;
	}

	.address-form__label-chip {
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

	.address-form__label-chip:hover {
		border-color: var(--md-sys-color-outline);
	}

	.address-form__label-chip--active {
		border-color: var(--md-sys-color-primary);
		background: color-mix(in srgb, var(--md-sys-color-primary-container) 40%, transparent);
		color: var(--md-sys-color-primary);
	}

	/* Fields */
	.address-form__fields {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.address-form__row {
		display: flex;
		gap: 10px;
	}

	.address-form__field {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.address-form__field--grow {
		flex: 2;
	}

	.address-form__field--small {
		flex: 0 0 80px;
	}

	.address-form__field-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
	}

	.address-form__required {
		color: var(--md-sys-color-error);
	}

	.address-form__input {
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

	.address-form__input:focus {
		outline: none;
		border-color: var(--md-sys-color-primary);
	}

	/* Toggle */
	.address-form__toggle {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		cursor: pointer;
	}

	.address-form__checkbox {
		width: 18px;
		height: 18px;
		accent-color: var(--md-sys-color-primary);
	}

	.address-form__toggle-label {
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface-variant);
	}

	/* Footer */
	.address-form__footer {
		display: flex;
		gap: 10px;
		padding: 12px 16px 24px;
		border-top: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 30%, transparent);
	}

	.address-form__cancel-btn {
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

	.address-form__cancel-btn:active {
		transform: scale(0.98);
	}

	.address-form__save-btn {
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

	.address-form__save-btn:disabled {
		cursor: not-allowed;
	}

	.address-form__save-btn--enabled {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		opacity: 1;
		box-shadow: 0 4px 12px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
	}

	.address-form__save-btn:active:not(:disabled) {
		transform: scale(0.98);
	}
</style>
