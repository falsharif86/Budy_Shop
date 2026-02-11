<script lang="ts">
	import type { MemberAddress } from '$lib/types/address.js';

	interface Props {
		address: MemberAddress;
		selected?: boolean;
		selectable?: boolean;
		onselect?: () => void;
		onedit?: () => void;
		ondelete?: () => void;
	}

	let { address, selected = false, selectable = false, onselect, onedit, ondelete }: Props = $props();

	const labelIcons: Record<string, string> = {
		Home: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
		Work: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0',
		Other: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'
	};
</script>

{#snippet cardBody()}
	<div class="address-card__header">
		<div class="address-card__label-row">
			<svg class="address-card__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path d={labelIcons[address.label] ?? labelIcons.Other} />
			</svg>
			<span class="address-card__label">{address.label}</span>
			{#if address.isDefault}
				<span class="address-card__badge">Default</span>
			{/if}
		</div>
		{#if !selectable && (onedit || ondelete)}
			<div class="address-card__actions">
				{#if onedit}
					<button class="address-card__action" onclick={() => onedit?.()} aria-label="Edit address">
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
						</svg>
					</button>
				{/if}
				{#if ondelete}
					<button class="address-card__action address-card__action--delete" onclick={() => ondelete?.()} aria-label="Delete address">
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
						</svg>
					</button>
				{/if}
			</div>
		{/if}
	</div>
	<p class="address-card__street">
		{address.streetAddress}{address.houseNumber ? ` ${address.houseNumber}` : ''}
	</p>
	{#if address.floor || address.building}
		<p class="address-card__detail">
			{[address.floor, address.building].filter(Boolean).join(', ')}
		</p>
	{/if}
	<p class="address-card__city">
		{[address.postalCode, address.city, address.country].filter(Boolean).join(', ')}
	</p>
{/snippet}

{#if selectable}
	<button
		class="address-card address-card--selectable"
		class:address-card--selected={selected}
		onclick={onselect}
		type="button"
	>
		{@render cardBody()}
	</button>
{:else}
	<div
		class="address-card"
		role="group"
	>
		{@render cardBody()}
	</div>
{/if}

<style>
	.address-card {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 100%;
		padding: 14px 16px;
		border-radius: 12px;
		background: var(--md-sys-color-surface-container);
		border: 1.5px solid var(--md-sys-color-outline-variant);
		text-align: left;
		transition: border-color 200ms ease, background-color 150ms ease;
	}

	.address-card--selectable {
		cursor: pointer;
	}

	.address-card--selectable:hover {
		border-color: var(--md-sys-color-outline);
	}

	.address-card--selected {
		border: 2px solid var(--md-sys-color-primary);
		background: color-mix(in srgb, var(--md-sys-color-primary-container) 30%, transparent);
	}

	.address-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.address-card__label-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.address-card__icon {
		width: 16px;
		height: 16px;
		color: var(--md-sys-color-primary);
		flex-shrink: 0;
	}

	.address-card__label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.address-card__badge {
		padding: 1px 8px;
		border-radius: 9999px;
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.address-card__actions {
		display: flex;
		gap: 4px;
	}

	.address-card__action {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 8px;
		transition: background-color 150ms ease;
	}

	.address-card__action:hover {
		background: var(--md-sys-color-surface-container-highest);
	}

	.address-card__action svg {
		width: 15px;
		height: 15px;
		color: var(--md-sys-color-on-surface-variant);
	}

	.address-card__action--delete:hover {
		background: var(--md-sys-color-error-container);
	}

	.address-card__action--delete:hover svg {
		color: var(--md-sys-color-on-error-container);
	}

	.address-card__street {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
	}

	.address-card__detail {
		font-size: 0.8125rem;
		color: var(--md-sys-color-on-surface-variant);
	}

	.address-card__city {
		font-size: 0.8125rem;
		color: var(--md-sys-color-outline);
	}
</style>
