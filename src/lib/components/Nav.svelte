<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const links = [
		{ href: '/', label: 'intro' },
		{ href: '/projects', label: 'projects' },
		{ href: '/notebooks', label: 'notebooks' },
		{ href: '/contact', label: 'contact' }
	] as const;

	function isCurrent(href: (typeof links)[number]['href']) {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(`${href}/`);
	}
</script>

<nav class="flex justify-end gap-14 text-[15px]">
	{#each links as link (link.href)}
		<a
			href={resolve(link.href)}
			aria-current={isCurrent(link.href) ? 'page' : undefined}
			class={isCurrent(link.href) ? 'underline decoration-1 underline-offset-4' : ''}
		>
			{link.label}
		</a>
	{/each}
</nav>
