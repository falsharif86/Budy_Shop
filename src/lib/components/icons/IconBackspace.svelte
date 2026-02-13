<script lang="ts">
	interface Props {
		class?: string;
		strokeWidth?: number;
	}
	let { class: className = '', strokeWidth = 2 }: Props = $props();
</script>

<svg class={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={strokeWidth}>
	<path d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.37-6.37a1.125 1.125 0 010-1.59l6.37-6.37A1.125 1.125 0 0110.21 4.5H19.5a1.125 1.125 0 011.125 1.125v12.75A1.125 1.125 0 0119.5 19.5h-9.29a1.125 1.125 0 01-.795-.33z" />
</svg>
