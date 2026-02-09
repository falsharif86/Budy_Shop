// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			tenant: {
				id: string;
				name: string;
				normalizedName: string;
			} | null;
		}
		interface PageData {
			tenant: {
				id: string;
				name: string;
			} | null;
		}
	}
}

export {};
