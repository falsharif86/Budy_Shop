export interface ToastItem {
	id: number;
	title: string;
	body?: string;
	onclick?: () => void;
}

let nextId = 0;
let toasts = $state<ToastItem[]>([]);

function createToastStore() {
	return {
		get toasts() {
			return toasts;
		},

		show(title: string, body?: string, onclick?: () => void) {
			const id = nextId++;
			toasts = [...toasts, { id, title, body, onclick }];
			setTimeout(() => {
				toasts = toasts.filter((t) => t.id !== id);
			}, 5000);
		},

		dismiss(id: number) {
			toasts = toasts.filter((t) => t.id !== id);
		}
	};
}

export const toastStore = createToastStore();
