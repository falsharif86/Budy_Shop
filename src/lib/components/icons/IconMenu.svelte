<script lang="ts">
	interface Props {
		class?: string;
		strokeWidth?: number;
	}
	let { class: className = '', strokeWidth = 2 }: Props = $props();
</script>

<svg class={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={strokeWidth}>
	<path d="M4 6h16M4 12h16M4 18h16" />
</svg>
