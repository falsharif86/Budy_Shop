<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { IconBackspace, IconSend } from '$lib/components/icons';

	interface Props {
		ondigit: (digit: string) => void;
		onbackspace: () => void;
		onsubmit: () => void;
		submitDisabled?: boolean;
		loading?: boolean;
	}

	let { ondigit, onbackspace, onsubmit, submitDisabled = false, loading = false }: Props = $props();

	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'backspace', '0', 'submit'];
</script>

<div class="numpad" transition:fly={{ y: 200, duration: 300, easing: cubicOut }}>
	{#each keys as key, i}
		{#if key === 'backspace'}
			<button
				class="numpad-key numpad-key--action"
				onclick={onbackspace}
				aria-label="Backspace"
				style="animation: stagger-in 200ms {30 * i}ms both"
			>
				<IconBackspace class="numpad-icon" />
			</button>
		{:else if key === 'submit'}
			<button
				class="numpad-key numpad-key--submit"
				onclick={onsubmit}
				disabled={submitDisabled || loading}
				aria-label="Send code"
				style="animation: stagger-in 200ms {30 * i}ms both"
			>
				{#if loading}
					<div class="numpad-spinner"></div>
				{:else}
					<IconSend class="numpad-icon" />
				{/if}
			</button>
		{:else}
			<button
				class="numpad-key"
				onclick={() => ondigit(key)}
				style="animation: stagger-in 200ms {30 * i}ms both"
			>
				{key}
			</button>
		{/if}
	{/each}
</div>

<style>
	.numpad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		max-width: 280px;
		width: 100%;
	}

	.numpad-key {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 56px;
		border: none;
		border-radius: var(--md-sys-shape-corner-medium);
		background: var(--md-sys-color-surface-container-high);
		color: var(--md-sys-color-on-surface);
		font: var(--md-sys-typescale-title-large);
		cursor: pointer;
		transition: background 150ms, transform 100ms ease;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
	}

	.numpad-key:active {
		transform: scale(0.92);
	}

	.numpad-key:hover {
		background: var(--md-sys-color-surface-container-highest);
	}

	.numpad-key--action {
		background: transparent;
	}

	.numpad-key--action:hover {
		background: var(--md-sys-color-surface-container-high);
	}

	.numpad-key--submit {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
	}

	.numpad-key--submit:hover:not(:disabled) {
		opacity: 0.9;
	}

	.numpad-key--submit:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.numpad-key--submit:disabled:active {
		transform: none;
	}

	:global(.numpad-icon) {
		width: 1.5rem;
		height: 1.5rem;
	}

	.numpad-spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 600ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
