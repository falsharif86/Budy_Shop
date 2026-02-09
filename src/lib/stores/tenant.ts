import { getContext, setContext } from 'svelte';

const TENANT_KEY = Symbol('tenant');

export interface TenantContext {
	id: string;
	name: string;
}

/**
 * Create tenant context during component init.
 * Call getTenantContext() in child components to read it.
 */
export function initTenantContext(): { set: (t: TenantContext | null) => void } {
	let current: TenantContext | null = null;
	const ctx = {
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

export function getTenantContext(): TenantContext | null {
	const ctx = getContext<{ value: TenantContext | null }>(TENANT_KEY);
	return ctx?.value ?? null;
}
