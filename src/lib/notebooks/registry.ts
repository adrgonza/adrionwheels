import type { Component } from 'svelte';

export type NotebookPage = {
	number: number;
	component: Component;
};

export type Notebook = {
	order: number;
	title: string;
	slug: string;
	cover?: string;
	pages: NotebookPage[];
	images: string[];
};

const pageModules = import.meta.glob<{ default: Component }>('./*/*/*.svelte', { eager: true });

const coverModules = import.meta.glob<string>('./*/cover.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', {
	eager: true,
	import: 'default'
});

const assetModules = import.meta.glob<string>(
	'./*/*/assets/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,gif}',
	{ eager: true, import: 'default' }
);

function slugify(title: string) {
	return title
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

const bySlug = new Map<string, Notebook>();

for (const [path, mod] of Object.entries(pageModules)) {
	const match = path.match(/^\.\/(\d+)-([^/]+)\/(\d+)\/[^/]+\.svelte$/);
	if (!match) continue;

	const order = Number(match[1]);
	const title = match[2].trim();
	const number = Number(match[3]);
	const slug = slugify(title);

	let notebook = bySlug.get(slug);
	if (!notebook) {
		notebook = { order, title, slug, pages: [], images: [] };
		bySlug.set(slug, notebook);
	}

	notebook.pages.push({ number, component: mod.default });
}

const assetOrder = new Map<string, { page: number; name: string }>();

for (const [path, url] of Object.entries(assetModules)) {
	const match = path.match(/^\.\/(\d+)-([^/]+)\/(\d+)\/assets\/([^/]+)$/);
	if (!match) continue;
	bySlug.get(slugify(match[2].trim()))?.images.push(url);
	assetOrder.set(url, { page: Number(match[3]), name: match[4] });
}

for (const [path, url] of Object.entries(coverModules)) {
	const match = path.match(/^\.\/(\d+)-([^/]+)\/cover\./);
	if (!match) continue;
	const notebook = bySlug.get(slugify(match[2].trim()));
	if (notebook) notebook.cover = url;
}

export const notebooks: Notebook[] = [...bySlug.values()]
	.map((notebook) => ({
		...notebook,
		pages: notebook.pages.sort((a, b) => a.number - b.number),
		images: notebook.images.sort((a, b) => {
			const left = assetOrder.get(a);
			const right = assetOrder.get(b);
			return (
				(left?.page ?? 0) - (right?.page ?? 0) ||
				(left?.name ?? '').localeCompare(right?.name ?? '', undefined, { numeric: true })
			);
		})
	}))
	.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export function getNotebook(slug: string) {
	return notebooks.find((notebook) => notebook.slug === slug);
}

const warming = new Map<string, Promise<void>>();

export function preloadImages(urls: string[]) {
	if (typeof Image === 'undefined') return Promise.resolve();

	return Promise.all(
		urls.map((src) => {
			let job = warming.get(src);
			if (!job) {
				job = new Promise((resolve) => {
					const img = new Image();
					const done = () => resolve();
					img.onload = () => {
						img.decode().then(done, done);
					};
					img.onerror = done;
					img.src = src;
				});
				warming.set(src, job);
			}
			return job;
		})
	);
}
