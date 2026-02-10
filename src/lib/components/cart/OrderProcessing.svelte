<script lang="ts">
</script>

<div class="processing">
	<div class="processing__spinner"></div>
	<p class="processing__text">Placing your order...</p>
</div>

<style>
	.processing {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 0;
	}

	.processing__spinner {
		width: 48px;
		height: 48px;
		margin-bottom: 24px;
		border: 4px solid var(--md-sys-color-surface-container);
		border-top-color: var(--md-sys-color-primary);
		border-radius: 9999px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.processing__text {
		font-size: 1rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}
</style>
