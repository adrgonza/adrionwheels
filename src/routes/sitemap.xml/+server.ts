import { notebooks } from '$lib/notebooks/registry';
import { SITE_URL } from '$lib/seo';

export const prerender = true;

export function GET() {
	const paths = ['/', '/projects', '/notebooks', ...notebooks.map((n) => `/notebooks/${n.slug}`)];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}
</urlset>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
