export interface OnlineOrderDetail {
	id: string;
	invoiceNo: string | null;
	orderNo: string | null;
	subtotal: number;
	discount: number;
	vat: number;
	total: number;
	cost: number;
	paymentTypeValue: number;
	paymentTypeName: string;
	statusValue: number;
	statusName: string;
	notes: string | null;
	creationTime: string;
	items: OnlineOrderItem[];
	orderTypeValue: number;
	fulfillmentTypeValue: number;
	customerName: string | null;
	customerPhone: string | null;
	customerNotes: string | null;
	onlineMemberEmail?: string | null;
	deliveryLabel?: string | null;
	deliveryStreetAddress?: string | null;
	deliveryHouseNumber?: string | null;
	deliveryFloor?: string | null;
	deliveryBuilding?: string | null;
	deliveryCity?: string | null;
	deliveryPostalCode?: string | null;
	deliveryCountry?: string | null;
	deliveryLatitude?: number | null;
	deliveryLongitude?: number | null;
}

export interface OnlineOrderItem {
	id: string;
	productId: string;
	productName: string;
	variantId: string | null;
	variantName: string | null;
	quantity: number;
	unitPrice: number;
	total: number;
}

export interface OrderHistoryEntry {
	id: string;
	orderNo: string | null;
	total: number;
	itemCount: number;
	creationTime: string;
}

// --- Member Orders (server-side history) ---

export interface MemberOrder {
	id: string;
	orderNo: string | null;
	subtotal: number;
	total: number;
	statusValue: number;
	statusName: string;
	fulfillmentTypeValue: number;
	itemCount: number;
	creationTime: string;
}

export interface MemberOrderListResult {
	items: MemberOrder[];
	totalCount: number;
}

export interface MemberOrderItem {
	id: string;
	productId: string;
	productName: string;
	productImageUrl: string | null;
	variantId: string | null;
	variantName: string | null;
	quantity: number;
	unitPrice: number;
	total: number;
}

export interface MemberOrderDetail {
	id: string;
	orderNo: string | null;
	subtotal: number;
	discount: number;
	vat: number;
	total: number;
	statusValue: number;
	statusName: string;
	fulfillmentTypeValue: number;
	customerName: string | null;
	customerPhone: string | null;
	customerNotes: string | null;
	creationTime: string;
	items: MemberOrderItem[];
	deliveryLabel: string | null;
	deliveryStreetAddress: string | null;
	deliveryHouseNumber: string | null;
	deliveryFloor: string | null;
	deliveryBuilding: string | null;
	deliveryCity: string | null;
	deliveryPostalCode: string | null;
	deliveryCountry: string | null;
}
