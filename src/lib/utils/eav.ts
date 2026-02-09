import type { Product } from '$lib/types/product.js';

/**
 * Extract an attribute text value from a product's EAV attributes.
 * Language fallback: try exact lang -> try 'en' -> any language -> null
 */
function getAttributeText(
	product: Product,
	key: string,
	lang = 'en'
): string | null {
	const attrs = product.attributes.filter(
		(a) => a.attributeKey === key && !a.isDeleted
	);
	if (attrs.length === 0) return null;

	const exact = attrs.find((a) => a.languageCode === lang);
	if (exact?.textValue) return exact.textValue;

	const en = attrs.find((a) => a.languageCode === 'en');
	if (en?.textValue) return en.textValue;

	const any = attrs.find((a) => !!a.textValue);
	return any?.textValue ?? null;
}

export function getProductName(product: Product, lang = 'en'): string {
	return getAttributeText(product, 'name', lang) ?? product.sku;
}

export function getProductDescription(product: Product, lang = 'en'): string | null {
	return getAttributeText(product, 'description', lang);
}

export function getProductBrand(product: Product, lang = 'en'): string | null {
	return getAttributeText(product, 'brand', lang);
}

export function getProductNotes(product: Product, lang = 'en'): string | null {
	return getAttributeText(product, 'notes', lang);
}

export function getProductIngredients(product: Product, lang = 'en'): string | null {
	return getAttributeText(product, 'ingredients', lang);
}
