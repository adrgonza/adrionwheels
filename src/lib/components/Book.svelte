<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { NotebookPage } from '$lib/notebooks/registry';
	import { MediaQuery } from 'svelte/reactivity';

	let { pages }: { pages: NotebookPage[] } = $props();

	const portrait = new MediaQuery('(orientation: portrait)', false);

	type Dir = 1 | -1;
	type Turn = { dir: Dir; p: number; to: 0 | 1 | null };

	let index = $state(0);
	let turn = $state<Turn | null>(null);
	let width = $state(0);

	let frame = 0;
	let drag: { id: number; x: number; lastX: number; lastT: number; v: number } | null = null;
	let dragged = false;

	const maxIndex = $derived(Math.max(0, pages.length - 1));
	const target = $derived(turn ? index + turn.dir : index);
	const lift = $derived(turn ? Math.sin(Math.PI * turn.p) : 0);
	const leafAngle = $derived(turn ? 95 * (turn.dir === 1 ? turn.p : 1 - turn.p) : 0);

	const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
	const easeInOut = (k: number) => 0.5 - Math.cos(Math.PI * k) / 2;
	const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);

	function canTurn(dir: Dir) {
		const to = index + dir;
		return to >= 0 && to <= maxIndex;
	}

	function finish(to: 0 | 1) {
		cancelAnimationFrame(frame);
		if (turn && to === 1) index += turn.dir;
		turn = null;
	}

	function settle(to: 0 | 1) {
		if (!turn) return;
		cancelAnimationFrame(frame);
		turn.to = to;
		const from = turn.p;
		const ease = from === 0 ? easeInOut : easeOut;
		const duration = Math.max(160, 900 * Math.abs(to - from));
		const start = performance.now();

		const step = (now: number) => {
			if (!turn) return;
			const k = Math.min(1, (now - start) / duration);
			turn.p = from + (to - from) * ease(k);
			if (k < 1) frame = requestAnimationFrame(step);
			else finish(to);
		};
		frame = requestAnimationFrame(step);
	}

	function flip(dir: Dir) {
		if (turn) finish(turn.to ?? 1);
		if (!canTurn(dir)) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			index += dir;
			return;
		}
		turn = { dir, p: 0, to: null };
		settle(1);
	}

	function onKey(event: KeyboardEvent) {
		if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
			event.preventDefault();
			flip(1);
		} else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
			event.preventDefault();
			flip(-1);
		} else if (event.key === 'Escape') {
			goto(resolve('/notebooks'));
		}
	}

	function pointerDown(event: PointerEvent) {
		if (event.button !== 0 || turn) return;
		dragged = false;
		drag = { id: event.pointerId, x: event.clientX, lastX: event.clientX, lastT: event.timeStamp, v: 0 };
	}

	function pointerMove(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id) return;
		const dx = event.clientX - drag.x;

		if (!turn) {
			if (Math.abs(dx) < 8) return;
			const dir: Dir = dx < 0 ? 1 : -1;
			if (!canTurn(dir)) return;
			turn = { dir, p: 0, to: null };
			dragged = true;
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		}

		const dt = Math.max(1, event.timeStamp - drag.lastT);
		drag.v = (event.clientX - drag.lastX) / dt;
		drag.lastX = event.clientX;
		drag.lastT = event.timeStamp;
		turn.p = clamp((-dx * turn.dir) / (width * 0.8), 0, 1);
	}

	function pointerUp(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id) return;
		const { v } = drag;
		drag = null;
		if (!turn || turn.to !== null) return;
		const flick = -v * turn.dir > 0.35;
		const back = v * turn.dir > 0.35;
		settle(!back && (turn.p > 0.4 || flick) ? 1 : 0);
	}

	function click(dir: Dir) {
		if (dragged) {
			dragged = false;
			return;
		}
		flip(dir);
	}
</script>

<svelte:window onkeydown={onKey} />

{#snippet half(i: number, side: 'left' | 'right')}
	{@const Sheet = pages[i].component}
	<div class="absolute inset-0 overflow-hidden bg-white">
		<div class="absolute inset-y-0 w-[200%] [&>*]:h-full {side === 'left' ? 'left-0' : 'right-0'}">
			<Sheet />
		</div>
		{#if i > 0}
			{@render folio(side === 'left' ? i * 2 : i * 2 + 1, side)}
		{/if}
	</div>
{/snippet}

{#snippet whole(i: number)}
	{@const Sheet = pages[i].component}
	<div class="absolute inset-0 overflow-hidden bg-white [&>*]:h-full">
		<Sheet />
		{#if i > 0}
			{@render folio(i + 1, 'center')}
		{/if}
	</div>
{/snippet}

{#snippet folio(n: number, side: 'left' | 'right' | 'center')}
	<span
		class="absolute bottom-[clamp(1.25rem,4.5vh,3rem)] !h-auto font-serif text-[11px] tracking-[0.08em] text-neutral-400 tabular-nums {side ===
		'left'
			? 'left-[clamp(1.25rem,8vw,10rem)]'
			: side === 'right'
				? 'right-[clamp(1.25rem,8vw,10rem)]'
				: 'inset-x-0 text-center'}"
	>
		{n}
	</span>
{/snippet}

<div class="fixed inset-0 overflow-hidden bg-white text-neutral-900 select-none" bind:clientWidth={width}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="absolute inset-0 touch-none [perspective:2800px]"
		onpointerdown={pointerDown}
		onpointermove={pointerMove}
		onpointerup={pointerUp}
		onpointercancel={pointerUp}
	>
		{#if pages.length > 0 && portrait.current}
			{@render whole(turn?.dir === 1 ? target : index)}
			<div
				class="pointer-events-none absolute inset-y-0 left-0 w-[12vw] bg-[linear-gradient(to_right,rgb(0_0_0/0.06),transparent)]"
				aria-hidden="true"
			></div>

			{#if turn}
				<div
					class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.18),transparent_60%)]"
					style:opacity={1 - leafAngle / 95}
				></div>
				<div
					class="pointer-events-none absolute inset-0 origin-left shadow-[0_0_48px_rgb(0_0_0/0.18)] backface-hidden"
					style:transform="rotateY({-leafAngle}deg)"
				>
					{@render whole(turn.dir === 1 ? index : target)}
					<div
						class="absolute inset-0 bg-[linear-gradient(to_left,rgb(0_0_0/0.28),rgb(0_0_0/0.06)_40%,transparent_75%)]"
						style:opacity={leafAngle / 95}
					></div>
				</div>
			{/if}
		{:else if pages.length > 0}
			<div class="absolute inset-y-0 left-0 w-1/2">
				{@render half(turn?.dir === -1 ? target : index, 'left')}
				{#if turn}
					<div
						class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_left,rgb(0_0_0/0.22),transparent_45%)]"
						style:opacity={turn.dir === -1 ? lift : turn.p > 0.5 ? lift * 0.6 : 0}
					></div>
				{/if}
			</div>
			<div class="absolute inset-y-0 right-0 w-1/2">
				{@render half(turn?.dir === 1 ? target : index, 'right')}
				{#if turn}
					<div
						class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.22),transparent_45%)]"
						style:opacity={turn.dir === 1 ? lift : turn.p > 0.5 ? lift * 0.6 : 0}
					></div>
				{/if}
			</div>

			<div
				class="pointer-events-none absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 bg-[linear-gradient(to_right,transparent,rgb(0_0_0/0.035)_48%,rgb(0_0_0/0.07)_50%,rgb(0_0_0/0.035)_52%,transparent)]"
				aria-hidden="true"
			></div>

			{#if turn}
				<div
					class="pointer-events-none absolute inset-y-0 w-1/2 [transform-style:preserve-3d] {turn.dir === 1
						? 'right-0 origin-left'
						: 'left-0 origin-right'}"
					style:transform="rotateY({-turn.dir * 180 * turn.p}deg)"
				>
					<div class="absolute inset-0 backface-hidden">
						{@render half(index, turn.dir === 1 ? 'right' : 'left')}
						<div
							class="absolute inset-0 {turn.dir === 1
								? 'bg-[linear-gradient(to_right,rgb(0_0_0/0.3),rgb(0_0_0/0.08)_35%,transparent_70%,rgb(255_255_255/0.4))]'
								: 'bg-[linear-gradient(to_left,rgb(0_0_0/0.3),rgb(0_0_0/0.08)_35%,transparent_70%,rgb(255_255_255/0.4))]'}"
							style:opacity={Math.min(1, turn.p * 2)}
						></div>
					</div>
					<div class="absolute inset-0 backface-hidden [transform:rotateY(180deg)]">
						{@render half(target, turn.dir === 1 ? 'left' : 'right')}
						<div
							class="absolute inset-0 {turn.dir === 1
								? 'bg-[linear-gradient(to_left,rgb(0_0_0/0.25),rgb(0_0_0/0.06)_35%,transparent_70%)]'
								: 'bg-[linear-gradient(to_right,rgb(0_0_0/0.25),rgb(0_0_0/0.06)_35%,transparent_70%)]'}"
							style:opacity={Math.min(1, (1 - turn.p) * 2)}
						></div>
					</div>
				</div>
			{/if}
		{/if}

		<button
			type="button"
			class="absolute inset-y-0 left-0 cursor-pointer disabled:cursor-default {portrait.current
				? 'w-1/3'
				: 'w-1/2'}"
			aria-label="Previous page"
			onclick={() => click(-1)}
			disabled={index === 0 && !turn}
		></button>
		<button
			type="button"
			class="absolute inset-y-0 right-0 cursor-pointer disabled:cursor-default {portrait.current
				? 'w-2/3'
				: 'w-1/2'}"
			aria-label="Next page"
			onclick={() => click(1)}
			disabled={index === maxIndex && !turn}
		></button>
	</div>

	<header
		class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 text-[12px] text-neutral-500 sm:px-8 sm:py-6"
	>
		<a href={resolve('/notebooks')} class="pointer-events-auto hover:text-neutral-900">← Notebooks</a>
	</header>
</div>
