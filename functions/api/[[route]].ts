import type { KVNamespace } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { handle } from "hono/cloudflare-pages";

type Bindings = {
  ANUWONG_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.get("/hello", (c) => {
  return c.json({
    message: "Hello, Cloudflare Pages!",
  });
});

app.get("/pages/:slug/views", async (c) => {
  const { slug } = c.req.param();
  const count = await c.env.ANUWONG_KV.get(slug);

  if (count === null) {
    await c.env.ANUWONG_KV.put(slug, "1");
    return c.json({
      slug: slug,
      count: 1,
    });
  }

  return c.json({
    slug: slug,
    count: count || 0,
  });
});

app.put("/pages/:slug/views", async (c) => {
  const { slug } = c.req.param();
  const count = await c.env.ANUWONG_KV.get(slug);
  if (count) {
    await c.env.ANUWONG_KV.put(slug, (Number(count) + 1).toString());
  } else {
    await c.env.ANUWONG_KV.put(slug, "1");
  }

  return c.json({
    slug: slug,
    count: Number(count) + 1 || 1,
  });
});

app.get("/pages/:slug/likes", async (c) => {
  const { slug } = c.req.param();
  const count = await c.env.ANUWONG_KV.get(`like:${slug}`);

  if (count === null) {
    await c.env.ANUWONG_KV.put(`like:${slug}`, "0");
    return c.json({
      slug: slug,
      likes: 0,
    });
  }

  return c.json({
    slug: slug,
    likes: Number(count) || 0,
  });
})

app.put("/pages/:slug/likes", async (c) => {
  const { slug } = c.req.param();
  const count = await c.env.ANUWONG_KV.get(`like:${slug}`);
  if (count) {
    await c.env.ANUWONG_KV.put(`like:${slug}`, (Number(count) + 1).toString());
  } else {
    await c.env.ANUWONG_KV.put(`like:${slug}`, "1");
  }

  setCookie(c, `liked_${slug}`, "true")
  return c.json({
    slug: slug,
    likes: Number(count) + 1 || 1,
  });
})

export const onRequest = handle(app);
