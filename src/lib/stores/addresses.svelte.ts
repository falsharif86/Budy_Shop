import type { MemberAddress, CreateAddressPayload } from '$lib/types/address.js';

function createAddressStore() {
	let addresses = $state<MemberAddress[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let memberId = $state<string | null>(null);

	const defaultAddress = $derived(addresses.find((a) => a.isDefault) ?? addresses[0] ?? null);
	const hasAddresses = $derived(addresses.length > 0);

	async function loadProfile() {
		try {
			const res = await fetch('/api/profile');
			if (res.ok) {
				const data = await res.json();
				memberId = data.memberId ?? data.id ?? null;
			}
		} catch {
			// Profile load failed silently
		}
	}

	async function load() {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/addresses');
			if (!res.ok) throw new Error(`Failed to load addresses (${res.status})`);
			addresses = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load addresses';
		} finally {
			loading = false;
		}
	}

	async function create(payload: CreateAddressPayload): Promise<MemberAddress | null> {
		error = null;
		try {
			const res = await fetch('/api/addresses', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`Failed to create address (${res.status})`);
			const created: MemberAddress = await res.json();
			if (created.isDefault) {
				addresses = addresses.map((a) => ({ ...a, isDefault: false }));
			}
			addresses = [...addresses, created];
			return created;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create address';
			return null;
		}
	}

	async function update(id: string, payload: CreateAddressPayload): Promise<boolean> {
		error = null;
		try {
			const res = await fetch(`/api/addresses/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`Failed to update address (${res.status})`);
			const updated: MemberAddress = await res.json();
			if (updated.isDefault) {
				addresses = addresses.map((a) =>
					a.id === id ? updated : { ...a, isDefault: false }
				);
			} else {
				addresses = addresses.map((a) => (a.id === id ? updated : a));
			}
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update address';
			return false;
		}
	}

	async function remove(id: string): Promise<boolean> {
		error = null;
		try {
			const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(`Failed to delete address (${res.status})`);
			addresses = addresses.filter((a) => a.id !== id);
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete address';
			return false;
		}
	}

	function clear() {
		addresses = [];
		memberId = null;
		error = null;
		loading = false;
	}

	return {
		get addresses() {
			return addresses;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get memberId() {
			return memberId;
		},
		get defaultAddress() {
			return defaultAddress;
		},
		get hasAddresses() {
			return hasAddresses;
		},
		loadProfile,
		load,
		create,
		update,
		remove,
		clear
	};
}

export const addressStore = createAddressStore();
