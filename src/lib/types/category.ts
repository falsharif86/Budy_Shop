export interface Category {
	id: string;
	name: string;
	displayName: string | null;
	iconUrl: string | null;
	colorHex: string | null;
	sortOrder: number;
	productCount: number;
}
