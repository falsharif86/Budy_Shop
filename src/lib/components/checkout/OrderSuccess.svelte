<script lang="ts">
	interface Props {
		oncontinue: () => void;
	}

	let { oncontinue }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 text-center" style="animation: fade-in 400ms ease-out;">
	<!-- Checkmark circle -->
	<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--md-sys-color-primary-container)]" style="animation: stagger-in 400ms ease-out;">
		<svg class="h-10 w-10 text-[var(--md-sys-color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
			<path
				d="M5 13l4 4L19 7"
				stroke-dasharray="24"
				stroke-dashoffset="24"
				style="animation: checkmark-draw 500ms 200ms ease-out forwards;"
			/>
		</svg>
	</div>

	<h2 class="mb-2 text-xl font-semibold text-[var(--md-sys-color-on-surface)]">
		Order Placed!
	</h2>
	<p class="mb-8 text-sm text-[var(--md-sys-color-outline)]">
		Your order has been received. We'll notify you when it's ready.
	</p>

	<button
		class="rounded-full bg-[var(--md-sys-color-primary)] px-8 py-3 font-medium text-[var(--md-sys-color-on-primary)]"
		onclick={oncontinue}
	>
		Continue Shopping
	</button>
</div>
