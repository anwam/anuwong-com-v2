import type { KVNamespace } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";

type Bindings = {
  PAGE_VIEW: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.get("/hello", (c) => {
  return c.json({
    message: "Hello, Cloudflare Pages!",
  });
});

app.get("/pages/:slug/views", async (c) => {
  const { slug } = c.req.param();
  const count = await c.env.PAGE_VIEW.get(slug);

  if (count === null) {
    await c.env.PAGE_VIEW.put(slug, "1");
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
  const count = await c.env.PAGE_VIEW.get(slug);
  if (count) {
    await c.env.PAGE_VIEW.put(slug, (Number(count) + 1).toString());
  } else {
    await c.env.PAGE_VIEW.put(slug, "1");
  }

  return c.json({
    slug: slug,
    count: Number(count) + 1 || 1,
  });
});

export const onRequest = handle(app);
