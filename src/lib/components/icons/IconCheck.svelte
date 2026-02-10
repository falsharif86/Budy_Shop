<script lang="ts">
	interface Props {
		class?: string;
		strokeWidth?: number;
	}
	let { class: className = '', strokeWidth = 2 }: Props = $props();
</script>

<svg class={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={strokeWidth}>
	<path d="M4.5 12.75l6 6 9-13.5" />
</svg>
