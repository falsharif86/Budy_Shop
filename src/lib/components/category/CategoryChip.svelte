<script lang="ts">
	interface Props {
		name: string;
		displayName?: string | null;
		iconUrl?: string | null;
		isSelected: boolean;
		fallbackIconPath?: string;
		onclick: () => void;
	}

	let {
		name,
		displayName = null,
		iconUrl = null,
		isSelected,
		fallbackIconPath = 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
		onclick
	}: Props = $props();
</script>

<button
	class="category-chip"
	class:selected={isSelected}
	onclick={onclick}
>
	<!-- Icon -->
	<div class="category-chip__icon">
		{#if iconUrl}
			<img
				src={iconUrl}
				alt=""
				class="category-chip__img"
				class:selected={isSelected}
			/>
		{:else}
			<svg
				class="category-chip__svg"
				class:selected={isSelected}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<path d={fallbackIconPath} />
			</svg>
		{/if}
	</div>

	<!-- Label -->
	<span class="category-chip__label" class:selected={isSelected}>
		{displayName ?? name}
	</span>
</button>

<style>
	.category-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		flex-shrink: 0;
		min-width: 84px;
		height: 76px;
		padding: 10px 12px;
		border-radius: 16px;
		border: 1px solid transparent;
		background: var(--md-sys-color-surface-container-high);
		transition: all 0.15s ease;
	}

	.category-chip:hover:not(.selected) {
		background: var(--md-sys-color-surface-container-highest);
	}

	.category-chip.selected {
		background: var(--md-sys-color-primary-container);
		border-color: var(--md-sys-color-primary);
		box-shadow: 0 0 12px rgba(0, 200, 150, 0.2);
	}

	.category-chip__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
	}

	.category-chip__img {
		width: 24px;
		height: 24px;
		object-fit: contain;
		filter: brightness(0) saturate(100%) invert(73%) sepia(42%) saturate(600%) hue-rotate(115deg) brightness(95%) contrast(95%);
	}

	.category-chip__img.selected {
		filter: brightness(0) saturate(100%) invert(64%) sepia(85%) saturate(400%) hue-rotate(115deg) brightness(95%) contrast(101%);
	}

	.category-chip__svg {
		width: 24px;
		height: 24px;
		color: var(--md-sys-color-primary);
	}

	.category-chip__svg.selected {
		color: var(--md-sys-color-on-primary-container);
	}

	.category-chip__label {
		max-width: 76px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 11px;
		font-weight: 500;
		line-height: 1;
		color: var(--md-sys-color-on-surface-variant);
	}

	.category-chip__label.selected {
		color: var(--md-sys-color-on-primary-container);
	}
</style>
