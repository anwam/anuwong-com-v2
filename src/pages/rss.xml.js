import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	const filtered = posts.filter((post) => !post.data.draft).sort((a, b) => b.data.date - a.data.date);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: filtered.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			link: `/blog/${post.slug}/`,
		})),
	});
}
