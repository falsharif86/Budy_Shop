<script lang="ts">
	interface Props {
		count: number;
		pulse?: boolean;
	}

	let { count, pulse = false }: Props = $props();

	const display = $derived(count > 99 ? '99+' : String(count));
</script>

{#if count > 0}
	<span class="badge" class:animate-[pulse-badge_300ms_ease-out]={pulse}>
		{display}
	</span>
{/if}

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 5px;
		border-radius: 9999px;
		background: var(--md-sys-color-error);
		color: var(--md-sys-color-on-error);
		border: 2.5px solid var(--md-sys-color-surface);
		font-size: 11px;
		font-weight: 600;
		line-height: 1;
	}
</style>
