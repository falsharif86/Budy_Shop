export interface Category {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	iconUrl: string | null;
	orderIndex: number;
	isVisible: boolean;
	masterProductCategoryId: string | null;
	translations: CategoryTranslations | null;
}

export interface SubCategory {
	id: string;
	name: string;
	displayName: string;
	productCategoryId: string;
	iconUrl: string | null;
	orderIndex: number;
	isVisible: boolean;
	masterProductSubCategoryId: string | null;
	translations: CategoryTranslations | null;
}

export interface CategoryTranslations {
	name: Record<string, string>;
	displayName: Record<string, string>;
}

export function getCategoryDisplayName(category: Category, lang = 'en'): string {
	if (category.translations?.displayName?.[lang]) {
		return category.translations.displayName[lang];
	}
	if (category.translations?.displayName?.['en']) {
		return category.translations.displayName['en'];
	}
	return category.displayName || category.name;
}

export function getSubCategoryDisplayName(sub: SubCategory, lang = 'en'): string {
	if (sub.translations?.displayName?.[lang]) {
		return sub.translations.displayName[lang];
	}
	if (sub.translations?.displayName?.['en']) {
		return sub.translations.displayName['en'];
	}
	return sub.displayName || sub.name;
}
