import type { Product } from '$lib/types/product.js';
import type { Category, SubCategory } from '$lib/types/category.js';
import { getProductName } from '$lib/utils/eav.js';
import { isInStock, isApproved } from '$lib/types/product.js';

function createProductStore() {
	let allProducts = $state<Product[]>([]);
	let categories = $state<Category[]>([]);
	let subCategories = $state<SubCategory[]>([]);
	let selectedCategoryId = $state<string | null>(null);
	let selectedSubCategoryId = $state<string | null>(null);
	let searchQuery = $state('');
	let lang = $state('en');

	const visibleProducts = $derived.by(() => {
		let filtered = allProducts.filter((p) => !p.isDeleted && isApproved(p));

		// Category filter
		if (selectedCategoryId) {
			filtered = filtered.filter((p) => p.productCategoryId === selectedCategoryId);
		}
		if (selectedSubCategoryId) {
			filtered = filtered.filter((p) => p.productSubCategoryId === selectedSubCategoryId);
		}

		// Search filter
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((p) => {
				const name = getProductName(p, lang).toLowerCase();
				const sku = p.sku.toLowerCase();
				const tags = p.tags.map((t) => t.tag.toLowerCase()).join(' ');
				return name.includes(q) || sku.includes(q) || tags.includes(q);
			});
		}

		// Sort: in-stock first, then by name
		return filtered.sort((a, b) => {
			const aStock = isInStock(a) ? 0 : 1;
			const bStock = isInStock(b) ? 0 : 1;
			if (aStock !== bStock) return aStock - bStock;
			return getProductName(a, lang).localeCompare(getProductName(b, lang));
		});
	});

	const activeSubCategories = $derived.by(() => {
		if (!selectedCategoryId) return [];
		return subCategories.filter((s) => s.productCategoryId === selectedCategoryId);
	});

	function setProducts(products: Product[]) {
		allProducts = products;
	}

	function setCategories(cats: Category[], subs: SubCategory[]) {
		categories = cats;
		subCategories = subs;
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
		get subCategories() {
			return subCategories;
		},
		get activeSubCategories() {
			return activeSubCategories;
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
		get lang() {
			return lang;
		},
		setProducts,
		setCategories,
		selectCategory,
		selectSubCategory,
		setSearch
	};
}

export const productStore = createProductStore();
