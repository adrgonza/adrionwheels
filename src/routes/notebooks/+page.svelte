<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Nav from '$lib/components/Nav.svelte';
	import { notebooks, preloadImages, type Notebook } from '$lib/notebooks/registry';

	let opening = $state<string | null>(null);

	async function openNotebook(event: MouseEvent, notebook: Notebook) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
		event.preventDefault();
		if (opening) return;
		opening = notebook.slug;
		await preloadImages(notebook.images);
		await goto(resolve('/notebooks/[slug]', { slug: notebook.slug }));
	}
</script>

<main class="min-h-screen bg-[#e6e6e6] px-6 py-8 sm:px-12 lg:px-16">
	<Nav />

	<ul class="mt-16 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
		{#each notebooks as notebook (notebook.slug)}
			<li>
				<a
					href={resolve('/notebooks/[slug]', { slug: notebook.slug })}
					class="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-800 {opening ===
					notebook.slug
						? 'cursor-wait'
						: ''}"
					aria-busy={opening === notebook.slug}
					onclick={(event) => openNotebook(event, notebook)}
				>
					<div
						class="aspect-[1414/2000] overflow-hidden bg-[#e6c84a] {opening === notebook.slug
							? 'opacity-60'
							: ''}"
					>
						{#if notebook.cover}
							<img
								src={notebook.cover}
								alt=""
								class="h-full w-full object-cover"
								draggable="false"
							/>
						{:else}
							<span
								class="flex h-full items-end justify-center pb-5 text-[11px] tracking-[0.28em] text-black/45"
							>
								{String(notebook.order).padStart(2, '0')}
							</span>
						{/if}
					</div>
					<p class="mt-3 text-center text-[13px] leading-snug text-neutral-900">{notebook.title}</p>
				</a>
			</li>
		{/each}
	</ul>
</main>
