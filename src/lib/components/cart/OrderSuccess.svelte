<script lang="ts">
	interface Props {
		oncontinue: () => void;
	}

	let { oncontinue }: Props = $props();
</script>

<div class="success-page" style="animation: fade-in 400ms ease-out;">
	<!-- Checkmark circle -->
	<div class="success-icon" style="animation: stagger-in 400ms ease-out;">
		<svg class="success-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
			<path
				d="M5 13l4 4L19 7"
				stroke-dasharray="24"
				stroke-dashoffset="24"
				style="animation: checkmark-draw 500ms 200ms ease-out forwards;"
			/>
		</svg>
	</div>

	<h2 class="success-title">Order Placed!</h2>
	<p class="success-subtitle">Your order has been received. We'll notify you when it's ready.</p>

	<button class="success-btn" onclick={oncontinue}>
		Continue Shopping
	</button>
</div>

<style>
	.success-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64px 0;
		text-align: center;
	}

	.success-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		border-radius: 9999px;
		background: var(--md-sys-color-primary-container);
		margin-bottom: 24px;
	}

	.success-icon__svg {
		width: 40px;
		height: 40px;
		color: var(--md-sys-color-primary);
	}

	.success-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		margin-bottom: 8px;
	}

	.success-subtitle {
		font-size: 0.875rem;
		color: var(--md-sys-color-outline);
		margin-bottom: 32px;
	}

	.success-btn {
		padding: 12px 32px;
		border-radius: 9999px;
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		font-weight: 500;
		cursor: pointer;
	}
</style>
