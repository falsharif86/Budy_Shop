<script lang="ts">
	interface Props {
		class?: string;
		strokeWidth?: number;
	}
	let { class: className = '', strokeWidth = 2.5 }: Props = $props();
</script>

<svg class={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={strokeWidth}>
	<path d="M5 12h14" />
</svg>
