<script lang="ts">
	interface Props {
		class?: string;
		strokeWidth?: number;
	}
	let { class: className = '', strokeWidth = 2 }: Props = $props();
</script>

<svg class={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={strokeWidth}>
	<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
