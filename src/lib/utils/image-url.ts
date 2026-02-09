import type { Product, ProductDetail, ProductImage } from '$lib/types/product.js';

/**
 * Get the main product image URL for list views.
 */
export function getProductImageUrl(product: Product): string {
	if (product.mainImageUrl) {
		return product.mainImageUrl;
	}
	return getPlaceholderUrl();
}

/**
 * Get all product images for detail views.
 */
export function getAllProductImages(product: ProductDetail): string[] {
	const urls: string[] = [];
	if (product.mainImageUrl) urls.push(product.mainImageUrl);
	for (const img of product.images) {
		if (img.filePath && !urls.includes(img.filePath)) {
			urls.push(img.filePath);
		}
	}
	if (urls.length === 0) urls.push(getPlaceholderUrl());
	return urls;
}

export function getImageUrl(image: ProductImage): string {
	return image.filePath;
}

export function getPlaceholderUrl(size = 400): string {
	return `data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
			<rect width="${size}" height="${size}" fill="%23e1e4d9"/>
			<text x="50%" y="50%" font-family="system-ui" font-size="48" fill="%2373796d" text-anchor="middle" dominant-baseline="central">?</text>
		</svg>`
	)}`;
}
