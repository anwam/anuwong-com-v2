import assert from "node:assert/strict";
import test from "node:test";
import { createBlogCatalog } from "../src/modules/blog/catalog.ts";

const entry = (id: string, date: string, tags?: string[], draft?: boolean) => ({
  id,
  data: { title: id, date: new Date(date), tags, draft },
});

test("published catalog excludes drafts from posts, tags, and neighbours", () => {
  const input = [
    entry("middle", "2024-02-01", ["go"]),
    entry("draft", "2025-01-01", ["secret"], true),
    entry("oldest", "2024-01-01", ["go", "tools"]),
    entry("newest", "2024-03-01", ["tools"]),
  ];
  const catalog = createBlogCatalog(input);
  assert.deepEqual(
    catalog.posts.map((post) => post.id),
    ["newest", "middle", "oldest"],
  );
  assert.deepEqual(
    catalog.tags.map(({ name, count, posts }) => ({
      name,
      count,
      ids: posts.map((post) => post.id),
    })),
    [
      { name: "go", count: 2, ids: ["middle", "oldest"] },
      { name: "tools", count: 2, ids: ["newest", "oldest"] },
    ],
  );
  assert.deepEqual(
    catalog.navigation.map(({ post, prev, next }) => [
      post.id,
      prev?.id ?? null,
      next?.id ?? null,
    ]),
    [
      ["oldest", null, "middle"],
      ["middle", "oldest", "newest"],
      ["newest", "middle", null],
    ],
  );
  assert.deepEqual(
    input.map((post) => post.id),
    ["middle", "draft", "oldest", "newest"],
  );
});

test("empty and untagged collections produce valid projections", () => {
  assert.deepEqual(createBlogCatalog([]), {
    posts: [],
    tags: [],
    navigation: [],
  });
  const post = entry("solo", "2024-01-01");
  assert.deepEqual(createBlogCatalog([post]), {
    posts: [post],
    tags: [],
    navigation: [{ post, prev: null, next: null }],
  });
});

test("tag counts count posts once and sort by popularity then name", () => {
  const catalog = createBlogCatalog([
    entry("first", "2024-01-01", ["z", "a", "a"]),
    entry("second", "2024-02-01", ["z"]),
  ]);
  assert.deepEqual(
    catalog.tags.map(({ name, count }) => ({ name, count })),
    [
      { name: "z", count: 2 },
      { name: "a", count: 1 },
    ],
  );
});
