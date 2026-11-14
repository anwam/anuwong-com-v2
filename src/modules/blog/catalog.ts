type Post = {
  id: string;
  data: { date: Date; draft?: boolean; tags?: string[] };
};

export function createBlogCatalog<T extends Post>(entries: readonly T[]) {
  const posts = entries
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const byTag = new Map<string, T[]>();
  for (const post of posts) {
    for (const tag of new Set(post.data.tags ?? [])) {
      const tagged = byTag.get(tag) ?? [];
      tagged.push(post);
      byTag.set(tag, tagged);
    }
  }
  const tags = Array.from(byTag, ([name, posts]) => ({
    name,
    count: posts.length,
    posts,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const chronological = [...posts].reverse();
  const navigation = chronological.map((post, index) => ({
    post,
    prev: chronological[index - 1] ?? null,
    next: chronological[index + 1] ?? null,
  }));
  return { posts, tags, navigation };
}
