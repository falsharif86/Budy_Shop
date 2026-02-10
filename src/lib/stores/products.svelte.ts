import type { Product } from '$lib/types/product.js';
import type { Category } from '$lib/types/category.js';
import { isInStock } from '$lib/types/product.js';

function createProductStore() {
	let allProducts = $state<Product[]>([]);
	let categories = $state<Category[]>([]);
	let selectedCategoryId = $state<string | null>(null);
	let selectedSubCategoryId = $state<string | null>(null);
	let searchQuery = $state('');

	const visibleProducts = $derived.by(() => {
		let filtered = allProducts;

		// Category filter
		if (selectedCategoryId) {
			filtered = filtered.filter((p) => p.categoryId === selectedCategoryId);
		}

		// SubCategory filter
		if (selectedSubCategoryId) {
			filtered = filtered.filter((p) => p.subCategoryId === selectedSubCategoryId);
		}

		// Search filter
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((p) => {
				const name = p.name.toLowerCase();
				const sku = p.sku.toLowerCase();
				return name.includes(q) || sku.includes(q);
			});
		}

		// Sort: in-stock first, then by name
		return filtered.sort((a, b) => {
			const aStock = isInStock(a) ? 0 : 1;
			const bStock = isInStock(b) ? 0 : 1;
			if (aStock !== bStock) return aStock - bStock;
			return a.name.localeCompare(b.name);
		});
	});

	function setProducts(products: Product[]) {
		allProducts = products;
	}

	function setCategories(cats: Category[]) {
		categories = cats;
	}

	function selectCategory(id: string | null) {
		selectedCategoryId = id;
		selectedSubCategoryId = null;
	}

	function selectSubCategory(id: string | null) {
		selectedSubCategoryId = id;
	}

	function setSearch(q: string) {
		searchQuery = q;
	}

	return {
		get products() {
			return visibleProducts;
		},
		get allProducts() {
			return allProducts;
		},
		get categories() {
			return categories;
		},
		get selectedCategoryId() {
			return selectedCategoryId;
		},
		get selectedSubCategoryId() {
			return selectedSubCategoryId;
		},
		get searchQuery() {
			return searchQuery;
		},
		setProducts,
		setCategories,
		selectCategory,
		selectSubCategory,
		setSearch
	};
}

export const productStore = createProductStore();
