<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte.js';
	import { IconClose } from '$lib/components/icons/index.js';
	import { fly, fade } from 'svelte/transition';
</script>

{#if toastStore.toasts.length > 0}
	<div class="toast-container" role="status" aria-live="polite">
		{#each toastStore.toasts as toast (toast.id)}
			<!-- svelte-ignore a11y_no_static_element_interactions a11y_no_noninteractive_tabindex -->
			<div
				class="toast"
				class:toast--clickable={!!toast.onclick}
				role={toast.onclick ? 'button' : undefined}
				tabindex={toast.onclick ? 0 : undefined}
				onclick={() => {
					if (toast.onclick) toast.onclick();
					toastStore.dismiss(toast.id);
				}}
				onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' && toast.onclick) { toast.onclick(); toastStore.dismiss(toast.id); } }}
				in:fly={{ y: -40, duration: 250 }}
				out:fade={{ duration: 150 }}
			>
				<div class="toast__content">
					<span class="toast__title">{toast.title}</span>
					{#if toast.body}
						<span class="toast__body">{toast.body}</span>
					{/if}
				</div>
				<button
					class="toast__close"
					onclick={(e: MouseEvent) => { e.stopPropagation(); toastStore.dismiss(toast.id); }}
					aria-label="Dismiss"
				>
					<IconClose class="toast__close-icon" />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 420px;
		width: calc(100% - 32px);
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 14px;
		border-radius: 12px;
		background: var(--md-sys-color-inverse-surface);
		color: var(--md-sys-color-inverse-on-surface);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		pointer-events: auto;
		text-align: left;
		width: 100%;
		cursor: default;
		font-family: inherit;
		font-size: inherit;
	}

	.toast--clickable {
		cursor: pointer;
	}

	.toast--clickable:hover {
		filter: brightness(1.1);
	}

	.toast__content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.toast__title {
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.toast__body {
		font-size: 0.75rem;
		opacity: 0.85;
	}

	.toast__close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 9999px;
		border: none;
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.15s ease;
	}

	.toast__close:hover {
		opacity: 1;
	}

	:global(.toast__close-icon) {
		width: 14px;
		height: 14px;
	}
</style>
