<script lang="ts">
	interface Props {
		count: number;
		pulse?: boolean;
	}

	let { count, pulse = false }: Props = $props();

	const display = $derived(count > 99 ? '99+' : String(count));
</script>

{#if count > 0}
	<span
		class="inline-flex items-center justify-center rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] border-[2.5px] border-[var(--md-sys-color-surface)]"
		class:animate-[pulse-badge_300ms_ease-out]={pulse}
		style="min-width: 20px; height: 20px; font-size: 11px; font-weight: 600; padding: 0 5px; line-height: 1;"
	>
		{display}
	</span>
{/if}
