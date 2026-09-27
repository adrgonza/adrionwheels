<script lang="ts">
	import { page } from '$app/state';
	import Book from '$lib/components/Book.svelte';
	import { getNotebook } from '$lib/notebooks/registry';

	const notebook = $derived(getNotebook(page.params.slug ?? ''));
</script>

<svelte:head>
	<title>{notebook?.title ?? 'Notebook'}</title>
</svelte:head>

{#if notebook}
	<Book pages={notebook.pages} />
{/if}
