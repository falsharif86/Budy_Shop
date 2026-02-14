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
	name: string;
	isEstablishment: boolean;
}

export async function fetchSuggestions(
	input: string,
	countryCode?: string
): Promise<Suggestion[]> {
	if (!input.trim()) return [];
	const google = (window as any).google;

	const request: any = { input };

	if (countryCode) {
		request.includedRegionCodes = [countryCode];
	}

	try {
		const { suggestions } =
			await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
		return suggestions
			.filter((s: any) => s.placePrediction)
			.map((s: any) => {
				const types: string[] = s.placePrediction.types ?? [];
				return {
					placeId: s.placePrediction.placeId,
					text: s.placePrediction.text.text,
					name: s.placePrediction.structuredFormat?.mainText?.text ?? '',
					isEstablishment: types.includes('establishment')
				};
			});
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

export const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 }; // Bangkok
export const DEFAULT_ZOOM = 15;

export const DARK_MAP_STYLES = [
	{ elementType: 'geometry', stylers: [{ color: '#212121' }] },
	{ elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
	{ elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
	{ elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
	{ featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
	{ featureType: 'poi', stylers: [{ visibility: 'off' }] },
	{ featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
	{ featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
	{ featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
	{ featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
	{ featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
	{ featureType: 'transit', stylers: [{ visibility: 'off' }] },
	{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
	{ featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] }
];

export function initMap(
	container: HTMLElement,
	lat: number,
	lng: number,
	zoom: number,
	styles?: any[]
): any {
	const google = (window as any).google;
	return new google.maps.Map(container, {
		center: { lat, lng },
		zoom,
		disableDefaultUI: true,
		zoomControl: true,
		gestureHandling: 'greedy',
		clickableIcons: false,
		styles: styles ?? [
			{ featureType: 'poi', stylers: [{ visibility: 'off' }] },
			{ featureType: 'transit', stylers: [{ visibility: 'off' }] }
		]
	});
}

export function addMarker(
	map: any,
	lat: number,
	lng: number,
	options?: { label?: string; icon?: any }
): any {
	const google = (window as any).google;
	return new google.maps.Marker({
		position: { lat, lng },
		map,
		draggable: false,
		...(options?.label ? { label: options.label } : {}),
		...(options?.icon ? { icon: options.icon } : {})
	});
}

export function drawRoute(
	map: any,
	origin: { lat: number; lng: number },
	destination: { lat: number; lng: number },
	options?: { color?: string; weight?: number }
): any {
	const google = (window as any).google;
	return new google.maps.Polyline({
		path: [origin, destination],
		geodesic: true,
		strokeColor: options?.color ?? '#00C896',
		strokeOpacity: 0.9,
		strokeWeight: options?.weight ?? 4,
		map
	});
}

export function fitBounds(
	map: any,
	points: { lat: number; lng: number }[],
	padding?: number
): void {
	const google = (window as any).google;
	const bounds = new google.maps.LatLngBounds();
	for (const p of points) {
		bounds.extend(p);
	}
	map.fitBounds(bounds, padding ?? 60);
}

export function haversineDistance(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): number {
	const R = 6371; // Earth radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export function estimateDeliveryMinutes(distanceKm: number): number {
	const avgSpeedKmh = 25;
	return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
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
