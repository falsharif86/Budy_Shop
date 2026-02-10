<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		size?: number;
		onanimationend?: () => void;
	}

	let { size = 120, onanimationend }: Props = $props();
	let started = $state(false);
	let animCount = 0;

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (mq.matches) {
			started = true;
			const timer = setTimeout(() => onanimationend?.(), 100);
			return () => clearTimeout(timer);
		}

		requestAnimationFrame(() => {
			started = true;
		});
	});

	function handleAnimEnd() {
		animCount++;
		if (animCount >= 3) {
			onanimationend?.();
		}
	}
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 1024 1024"
	width={size}
	height={size}
	role="img"
	aria-label="Budy logo"
	onanimationend={handleAnimEnd}
>
	<defs>
		<linearGradient
			id="splash-lg0"
			x1="441.52"
			y1="840.20"
			x2="194.84"
			y2="487.90"
			gradientUnits="userSpaceOnUse"
		>
			<stop offset="0%" stop-color="#2D8B5E" />
			<stop offset="100%" stop-color="#7EEDC4" />
		</linearGradient>
		<linearGradient
			id="splash-lg1"
			x1="582.48"
			y1="840.20"
			x2="829.16"
			y2="487.90"
			gradientUnits="userSpaceOnUse"
		>
			<stop offset="0%" stop-color="#2D8B5E" />
			<stop offset="100%" stop-color="#7EEDC4" />
		</linearGradient>
		<linearGradient
			id="splash-lg2"
			x1="512.00"
			y1="788.48"
			x2="512.00"
			y2="266.24"
			gradientUnits="userSpaceOnUse"
		>
			<stop offset="0%" stop-color="#2D8B5E" />
			<stop offset="100%" stop-color="#7EEDC4" />
		</linearGradient>
	</defs>

	<!-- center leaf (animates first, delay 0ms) -->
	<g class="leaf leaf--center" class:animate={started}>
		<path
			d="M 497.62,788.48 C 352.26,631.81 448.10,370.69 512.00,266.24 L 497.62,788.48 Z"
			fill="url(#splash-lg2)"
		/>
		<path
			d="M 526.38,788.48 C 671.74,631.81 575.90,370.69 512.00,266.24 L 526.38,788.48 Z"
			fill="url(#splash-lg2)"
		/>
	</g>

	<!-- right leaf (delay 180ms) -->
	<g class="leaf leaf--right" class:animate={started}>
		<path
			d="M 573.42,833.86 C 555.83,664.03 739.57,530.17 829.16,487.90 L 573.42,833.86 Z"
			fill="url(#splash-lg1)"
		/>
		<path
			d="M 591.54,846.55 C 757.14,804.99 820.09,586.55 829.16,487.90 L 591.54,846.55 Z"
			fill="url(#splash-lg1)"
		/>
	</g>

	<!-- left leaf (delay 360ms, animates last) -->
	<g class="leaf leaf--left" class:animate={started}>
		<path
			d="M 432.46,846.55 C 266.86,804.99 203.91,586.55 194.84,487.90 L 432.46,846.55 Z"
			fill="url(#splash-lg0)"
		/>
		<path
			d="M 450.58,833.86 C 468.17,664.03 284.43,530.17 194.84,487.90 L 450.58,833.86 Z"
			fill="url(#splash-lg0)"
		/>
	</g>
</svg>

<style>
	/* Leaves fan out from collapsed (all vertical) to their natural SVG positions.
	   Side leaves rotate inward at start, then release to their fanned-out geometry. */
	@keyframes leaf-fan-out {
		0% {
			opacity: 0;
			transform: rotate(var(--from-angle, 0deg)) scale(0.3);
		}
		100% {
			opacity: 1;
			transform: rotate(0deg) scale(1);
		}
	}

	.leaf {
		opacity: 0;
		will-change: transform, opacity;
	}

	.leaf--center {
		--from-angle: 0deg;
		transform-origin: 50% 77%;
	}

	.leaf--right {
		--from-angle: -35deg;
		transform-origin: 56.9% 82%;
	}

	.leaf--left {
		--from-angle: 35deg;
		transform-origin: 43.1% 82%;
	}

	.leaf.animate {
		animation: leaf-fan-out 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	.leaf--center.animate {
		animation-delay: 0ms;
	}

	.leaf--right.animate {
		animation-delay: 180ms;
	}

	.leaf--left.animate {
		animation-delay: 360ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.leaf {
			opacity: 1;
			transform: none;
		}

		.leaf.animate {
			animation: none;
		}
	}
</style>
