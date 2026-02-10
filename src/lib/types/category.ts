export interface SubCategory {
	id: string;
	name: string;
	displayName: string | null;
	iconUrl: string | null;
	sortOrder: number;
	productCount: number;
}

export interface Category {
	id: string;
	name: string;
	displayName: string | null;
	iconUrl: string | null;
	colorHex: string | null;
	sortOrder: number;
	productCount: number;
	subCategories: SubCategory[];
}
