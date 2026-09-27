<script lang="ts">
	let {
		images,
		layout
	}: {
		images: Record<string, string>;
		layout?: 'pair' | 'left' | 'right' | 'full';
	} = $props();

	const photos = $derived(
		Object.entries(images)
			.sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
			.map(([path, src]) => ({
				src,
				alt: (path.split('/').pop() ?? '')
					.replace(/\.[^.]+$/, '')
					.replace(/[-_]+/g, ' ')
			}))
	);

	const mode = $derived.by(() => {
		if (layout) return layout;
		if (photos.length >= 2) return 'pair' as const;
		const name = photos[0]?.alt ?? '';
		if (name === 'left') return 'left' as const;
		if (name === 'right') return 'right' as const;
		return 'full' as const;
	});

	const left = $derived(mode === 'pair' || mode === 'left' ? photos[0] : undefined);
	const right = $derived(mode === 'pair' ? photos[1] : mode === 'right' ? photos[0] : undefined);
</script>

{#snippet photo(item: { src: string; alt: string })}
	<img
		src={item.src}
		alt={item.alt}
		draggable="false"
		decoding="async"
		class="h-full w-full object-contain"
	/>
{/snippet}

{#if photos.length > 0}
	<div
		class="grid h-full grid-cols-2 bg-white portrait:grid-cols-1 portrait:py-[clamp(3.5rem,9vh,7rem)] {mode ===
		'pair'
			? 'portrait:grid-rows-2'
			: 'portrait:grid-rows-1'}"
	>
		{#if mode === 'full'}
			<figure
				class="col-span-2 m-0 min-h-0 px-[clamp(1.5rem,12vw,14rem)] py-[clamp(3.5rem,12vh,9rem)] portrait:col-span-1 portrait:px-[8vw] portrait:py-0"
			>
				{@render photo(photos[0])}
			</figure>
		{:else}
			<figure
				class="m-0 min-h-0 py-[clamp(3.5rem,16vh,12rem)] pr-[clamp(1.25rem,5vw,6rem)] pl-[clamp(1.25rem,8vw,10rem)] portrait:px-[10vw] portrait:pt-0 portrait:pb-[3vh] {left
					? ''
					: 'portrait:hidden'} {mode === 'left' ? 'portrait:pb-0' : ''}"
			>
				{#if left}{@render photo(left)}{/if}
			</figure>
			<figure
				class="m-0 min-h-0 py-[clamp(3.5rem,16vh,12rem)] pr-[clamp(1.25rem,8vw,10rem)] pl-[clamp(1.25rem,5vw,6rem)] portrait:px-[10vw] portrait:pt-[3vh] portrait:pb-0 {right
					? ''
					: 'portrait:hidden'} {mode === 'right' ? 'portrait:pt-0' : ''}"
			>
				{#if right}{@render photo(right)}{/if}
			</figure>
		{/if}
	</div>
{/if}
