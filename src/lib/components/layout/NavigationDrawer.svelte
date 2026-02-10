<script lang="ts">
	import Drawer from '$lib/components/shared/Drawer.svelte';
	import { ui } from '$lib/stores/ui.svelte.js';
</script>

<Drawer open={ui.navDrawerOpen} side="left" onclose={() => ui.closeNavDrawer()}>
	<div class="p-6">
		<h2 class="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">Menu</h2>
	</div>
</Drawer>
