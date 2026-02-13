/* eslint-disable @typescript-eslint/no-explicit-any */
let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
	if (loadPromise) return loadPromise;

	loadPromise = new Promise((resolve, reject) => {
		if (typeof window === 'undefined') {
			reject(new Error('Google Maps requires a browser environment'));
			return;
		}

		if ((window as any).google?.maps?.places) {
			resolve();
			return;
		}

		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => {
			loadPromise = null;
			reject(new Error('Failed to load Google Maps'));
		};
		document.head.appendChild(script);
	});

	return loadPromise;
}

export interface PlaceResult {
	streetAddress: string;
	houseNumber: string | null;
	city: string;
	postalCode: string | null;
	country: string;
	countryCode: string | null;
	latitude: number | null;
	longitude: number | null;
	placeId: string | null;
	formattedAddress: string;
}

export interface Suggestion {
	placeId: string;
	text: string;
}

export async function fetchSuggestions(
	input: string,
	countryCode?: string
): Promise<Suggestion[]> {
	if (!input.trim()) return [];
	const google = (window as any).google;

	const request: any = {
		input,
		includedPrimaryTypes: ['street_address', 'subpremise', 'route', 'premise']
	};

	if (countryCode) {
		request.includedRegionCodes = [countryCode];
	}

	try {
		const { suggestions } =
			await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
		return suggestions
			.filter((s: any) => s.placePrediction)
			.map((s: any) => ({
				placeId: s.placePrediction.placeId,
				text: s.placePrediction.text.text
			}));
	} catch {
		return [];
	}
}

export async function fetchPlaceById(placeId: string): Promise<PlaceResult | null> {
	const google = (window as any).google;

	try {
		const place = new google.maps.places.Place({ id: placeId });
		await place.fetchFields({
			fields: ['formattedAddress', 'location', 'addressComponents', 'id']
		});

		const components = place.addressComponents || [];
		const get = (type: string) =>
			components.find((c: any) => c.types.includes(type))?.longText ?? null;
		const getShort = (type: string) =>
			components.find((c: any) => c.types.includes(type))?.shortText ?? null;

		return {
			streetAddress: get('route') ?? '',
			houseNumber: get('street_number'),
			city: get('locality') ?? get('administrative_area_level_1') ?? '',
			postalCode: get('postal_code'),
			country: get('country') ?? '',
			countryCode: getShort('country')?.toLowerCase() ?? null,
			latitude: place.location?.lat() ?? null,
			longitude: place.location?.lng() ?? null,
			placeId: place.id ?? null,
			formattedAddress: place.formattedAddress ?? ''
		};
	} catch {
		return null;
	}
}

// --- Map utilities ---

export const DEFAULT_CENTER = { lat: 52.3676, lng: 4.9041 }; // Amsterdam
export const DEFAULT_ZOOM = 15;

export function initMap(
	container: HTMLElement,
	lat: number,
	lng: number,
	zoom: number
): any {
	const google = (window as any).google;
	return new google.maps.Map(container, {
		center: { lat, lng },
		zoom,
		disableDefaultUI: true,
		zoomControl: true,
		gestureHandling: 'greedy',
		clickableIcons: false,
		styles: [
			{ featureType: 'poi', stylers: [{ visibility: 'off' }] },
			{ featureType: 'transit', stylers: [{ visibility: 'off' }] }
		]
	});
}

export function addDraggableMarker(
	map: any,
	lat: number,
	lng: number,
	onDragEnd: (lat: number, lng: number) => void
): any {
	const google = (window as any).google;
	const marker = new google.maps.Marker({
		position: { lat, lng },
		map,
		draggable: true,
		animation: google.maps.Animation.DROP
	});

	marker.addListener('dragend', () => {
		const pos = marker.getPosition();
		if (pos) onDragEnd(pos.lat(), pos.lng());
	});

	return marker;
}

export async function reverseGeocode(lat: number, lng: number): Promise<PlaceResult | null> {
	const google = (window as any).google;
	const geocoder = new google.maps.Geocoder();

	try {
		const response = await geocoder.geocode({ location: { lat, lng } });
		const result = response.results?.[0];
		if (!result?.address_components) return null;

		const get = (type: string) =>
			result.address_components?.find((c: any) => c.types.includes(type))?.long_name ?? null;
		const getShort = (type: string) =>
			result.address_components?.find((c: any) => c.types.includes(type))?.short_name ?? null;

		return {
			streetAddress: get('route') ?? '',
			houseNumber: get('street_number'),
			city: get('locality') ?? get('administrative_area_level_1') ?? '',
			postalCode: get('postal_code'),
			country: get('country') ?? '',
			countryCode: getShort('country')?.toLowerCase() ?? null,
			latitude: lat,
			longitude: lng,
			placeId: result.place_id ?? null,
			formattedAddress: result.formatted_address ?? ''
		};
	} catch {
		return null;
	}
}

export function panTo(map: any, lat: number, lng: number, marker?: any): void {
	map.panTo({ lat, lng });
	if (marker) marker.setPosition({ lat, lng });
}
