<script lang="ts">
	import { getTenantContext } from '$lib/stores/tenant.js';

	const tenant = getTenantContext();
</script>

<header class="sticky top-0 z-20 border-b border-[var(--md-sys-color-outline-variant)]/15 bg-[var(--md-sys-color-surface)]/90 backdrop-blur-lg">
	<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
		<!-- Shop name -->
		<div class="flex items-center gap-2">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--md-sys-color-primary)]">
				<span class="text-xs font-bold text-[var(--md-sys-color-on-primary)]">
					{tenant?.name?.charAt(0)?.toUpperCase() ?? 'B'}
				</span>
			</div>
			<h1 class="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
				{tenant?.name ?? 'Shop'}
			</h1>
		</div>

		<!-- Powered by Budy -->
		<span class="text-xs text-[var(--md-sys-color-outline)]">
			Powered by <strong class="text-[var(--md-sys-color-primary)]">Budy</strong>
		</span>
	</div>
</header>
