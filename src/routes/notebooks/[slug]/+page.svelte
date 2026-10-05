<script lang="ts">
	import { page } from '$app/state';
	import Book from '$lib/components/Book.svelte';
	import { getNotebook, preloadImages } from '$lib/notebooks/registry';

	const notebook = $derived(getNotebook(page.params.slug ?? ''));

	$effect(() => {
		if (notebook) preloadImages(notebook.images);
	});
</script>

{#if notebook}
	<Book pages={notebook.pages} />
{/if}
