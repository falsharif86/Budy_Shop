import { env } from '$env/dynamic/private';

const API_BASE_URL = env.VITE_API_BASE_URL ?? 'https://api.budy.app';

interface FetchOptions extends RequestInit {
	params?: Record<string, string | number | undefined>;
}

export function createApiClient(tenantId: string, accessToken?: string) {
	async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
		const { params, ...fetchOptions } = options;

		let url = `${API_BASE_URL}${path}`;
		if (params) {
			const searchParams = new URLSearchParams();
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined) searchParams.set(key, String(value));
			}
			const qs = searchParams.toString();
			if (qs) url += `?${qs}`;
		}

		const headers = new Headers(fetchOptions.headers);
		headers.set('X-Tenant-Id', tenantId);
		headers.set('Accept', 'application/json');
		if (accessToken) {
			headers.set('Authorization', `Bearer ${accessToken}`);
		}
		if (fetchOptions.body && !headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		const response = await fetch(url, { ...fetchOptions, headers });

		if (!response.ok) {
			throw new ApiError(response.status, response.statusText, url);
		}

		const text = await response.text();
		return text ? JSON.parse(text) : ({} as T);
	}

	return {
		get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
			request<T>(path, { params }),
		post: <T>(path: string, body?: unknown) =>
			request<T>(path, {
				method: 'POST',
				body: body ? JSON.stringify(body) : undefined
			}),
		put: <T>(path: string, body?: unknown) =>
			request<T>(path, {
				method: 'PUT',
				body: body ? JSON.stringify(body) : undefined
			}),
		del: <T>(path: string) =>
			request<T>(path, { method: 'DELETE' })
	};
}

export class ApiError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public url: string
	) {
		super(`API Error ${status}: ${statusText} (${url})`);
		this.name = 'ApiError';
	}
}

export type ApiClient = ReturnType<typeof createApiClient>;
