<script lang="ts">
	interface Props {
		class?: string;
		strokeWidth?: number;
	}
	let { class: className = '', strokeWidth = 2 }: Props = $props();
</script>

<svg class={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={strokeWidth}>
	<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
</svg>
