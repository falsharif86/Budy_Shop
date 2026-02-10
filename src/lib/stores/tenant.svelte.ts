import { getContext, setContext } from 'svelte';

const TENANT_KEY = Symbol('tenant');

export interface TenantContext {
	id: string;
	name: string;
}

interface TenantStore {
	readonly value: TenantContext | null;
	set: (t: TenantContext | null) => void;
}

/**
 * Create tenant context during component init.
 * Call getTenantContext() in child components to read it.
 */
export function initTenantContext(): TenantStore {
	let current = $state<TenantContext | null>(null);
	const ctx: TenantStore = {
		get value() {
			return current;
		},
		set(t: TenantContext | null) {
			current = t;
		}
	};
	setContext(TENANT_KEY, ctx);
	return ctx;
}

export function getTenantContext(): TenantStore {
	return getContext<TenantStore>(TENANT_KEY);
}
