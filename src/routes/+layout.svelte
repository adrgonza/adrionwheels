<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import landing from '$lib/img/landing-img.JPG';
	import { page } from '$app/state';
	import { SITE_NAME, SITE_URL, metaFor } from '$lib/seo';
	import '../app.css';

	let { children } = $props();

	const path = $derived(page.url.pathname.replace(/\/+$/, '') || '/');
	const isError = $derived(page.status >= 400);
	const meta = $derived(metaFor(path, page.data?.title as string | undefined));
	const canonical = $derived(`${SITE_URL}${path === '/' ? '/' : path}`);
	const image = $derived(new URL(landing, SITE_URL).href);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if isError}
		<title>Not found | {SITE_NAME}</title>
		<meta name="robots" content="noindex" />
	{:else}
		<title>{meta.title}</title>
		<meta name="description" content={meta.description} />
		<link rel="canonical" href={canonical} />
		<meta property="og:type" content="website" />
		<meta property="og:site_name" content={SITE_NAME} />
		<meta property="og:title" content={meta.title} />
		<meta property="og:description" content={meta.description} />
		<meta property="og:url" content={canonical} />
		<meta property="og:image" content={image} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
</svelte:head>

{@render children()}
