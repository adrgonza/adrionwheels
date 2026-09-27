import { error } from '@sveltejs/kit';
import { getNotebook } from '$lib/notebooks/registry';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const notebook = getNotebook(params.slug);
	if (!notebook) error(404, 'Notebook not found');
	return { title: notebook.title };
};
