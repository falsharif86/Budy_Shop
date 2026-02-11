export type AddressLabel = 'Home' | 'Work' | 'Other';

export interface MemberAddress {
	id: string;
	label: AddressLabel;
	streetAddress: string;
	houseNumber: string | null;
	floor: string | null;
	building: string | null;
	city: string;
	postalCode: string | null;
	country: string;
	latitude: number | null;
	longitude: number | null;
	placeId: string | null;
	isDefault: boolean;
}

export interface CreateAddressPayload {
	label: AddressLabel;
	streetAddress: string;
	houseNumber?: string | null;
	floor?: string | null;
	building?: string | null;
	city: string;
	postalCode?: string | null;
	country: string;
	latitude?: number | null;
	longitude?: number | null;
	placeId?: string | null;
	isDefault?: boolean;
}
