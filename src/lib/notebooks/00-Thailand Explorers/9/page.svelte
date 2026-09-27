<script lang="ts">
	import PhotoPage from '$lib/components/PhotoPage.svelte';

	const images = import.meta.glob('./assets/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,gif}', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;
</script>

<PhotoPage {images} layout="right" />
