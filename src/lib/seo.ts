export const SITE_URL = 'https://adrionwheels.com';
export const SITE_NAME = 'adriOnWheels';
export const DEFAULT_DESCRIPTION =
	'adriOnWheels: travel notebooks by Adrian Gonzalez, with photos and handwritten pages from the road, starting with Thailand.';

type Meta = { title: string; description: string };

export function metaFor(pathname: string, notebookTitle?: string): Meta {
	if (pathname === '/projects') {
		return {
			title: `Projects | ${SITE_NAME}`,
			description: 'Projects by Adrian Gonzalez on adriOnWheels.'
		};
	}
	if (pathname === '/notebooks') {
		return {
			title: `Travel notebooks | ${SITE_NAME}`,
			description: 'Travel notebooks by Adrian Gonzalez: photo diaries and handwritten pages from each trip.'
		};
	}
	if (pathname.startsWith('/notebooks/') && notebookTitle) {
		return {
			title: `${notebookTitle} | ${SITE_NAME} travel notebook`,
			description: `${notebookTitle}, a travel notebook by Adrian Gonzalez with photos and notes from the trip.`
		};
	}
	return { title: `${SITE_NAME} | Travel notebooks by Adrian Gonzalez`, description: DEFAULT_DESCRIPTION };
}
