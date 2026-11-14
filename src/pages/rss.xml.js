import { getBlogCatalog } from "../modules/blog/getBlogCatalog";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

export async function GET(context) {
  const { posts } = await getBlogCatalog();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/blogs/${post.id}/`,
    })),
  });
}
