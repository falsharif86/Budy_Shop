const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

const compactFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
	maximumFractionDigits: 0
});

export function formatPrice(price: number): string {
	return formatter.format(price);
}

export function formatPriceCompact(price: number): string {
	if (Number.isInteger(price)) return compactFormatter.format(price);
	return formatter.format(price);
}
