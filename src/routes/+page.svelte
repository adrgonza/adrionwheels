<script lang="ts">
	import landing from '$lib/img/landing-img.JPG';
	import Nav from '$lib/components/Nav.svelte';
</script>

<div class="flex h-screen flex-col p-10">
	<Nav />

	<div class="min-h-0 flex-1">
		<img src={landing} alt="" class="h-full w-full object-cover" />
	</div>
</div>
