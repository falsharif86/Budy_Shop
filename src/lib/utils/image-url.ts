import type { Product, ProductImage } from '$lib/types/product.js';

const S3_BASE = 'https://buddy-product-pictures.s3.ap-southeast-7.amazonaws.com';

/**
 * Get the main product image URL, with optional resize via AWS Serverless Image Handler.
 */
export function getProductImageUrl(product: Product, width = 400): string {
	// Try mainImageUrl first
	if (product.mainImageUrl) {
		return product.mainImageUrl;
	}

	// Try images array
	const mainImage = product.images.find((i) => i.isMain && !i.isDeleted);
	if (mainImage?.filePath) {
		return mainImage.filePath;
	}

	// First image
	const firstImage = product.images.find((i) => !i.isDeleted);
	if (firstImage?.filePath) {
		return firstImage.filePath;
	}

	// Try UPC raw data for image
	if (product.sku) {
		return getPlaceholderUrl(width);
	}

	return getPlaceholderUrl(width);
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

export function getAllProductImages(product: Product): string[] {
	const urls: string[] = [];
	if (product.mainImageUrl) urls.push(product.mainImageUrl);
	for (const img of product.images) {
		if (!img.isDeleted && img.filePath && !urls.includes(img.filePath)) {
			urls.push(img.filePath);
		}
	}
	if (urls.length === 0) urls.push(getPlaceholderUrl());
	return urls;
}
