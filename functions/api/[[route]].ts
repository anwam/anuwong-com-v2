import type { KVNamespace } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { setCookie } from "hono/cookie";

type Bindings = {
	PAGE_VIEW: KVNamespace;
	LIKES: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
});

const safeKV = async <T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error("KV Operation Failed:", error);
    return fallback;
  }
};

app.get("/hello", (c) => {
	return c.json({
		message: "Hello, Cloudflare Pages!",
	});
});

app.get("/pages/:slug/views", async (c) => {
  const { slug } = c.req.param();
  if (!slug) return c.json({ error: "Slug is required" }, 400);

  const count = await safeKV(() => c.env.PAGE_VIEW.get(slug), null);

  if (count === null) {
    await safeKV(() => c.env.PAGE_VIEW.put(slug, "1"), null);
    return c.json({
      slug: slug,
      count: 1,
    });
  }

  return c.json({
    slug: slug,
    count: Number(count) || 0,
  });
});

app.put("/pages/:slug/views", async (c) => {
  const { slug } = c.req.param();
  if (!slug) return c.json({ error: "Slug is required" }, 400);

  const count = await safeKV(() => c.env.PAGE_VIEW.get(slug), null);
  if (count) {
    await safeKV(
      () => c.env.PAGE_VIEW.put(slug, (Number(count) + 1).toString()),
      null,
    );
  } else {
    await safeKV(() => c.env.PAGE_VIEW.put(slug, "1"), null);
  }

  return c.json({
    slug: slug,
    count: Number(count) + 1 || 1,
  });
});

app.get("/pages/:slug/likes", async (c) => {
  const { slug } = c.req.param();
  if (!slug) return c.json({ error: "Slug is required" }, 400);

  const count = await safeKV(() => c.env.LIKES.get(`like:${slug}`), null);

  if (count === null) {
    await safeKV(() => c.env.LIKES.put(`like:${slug}`, "0"), null);
    return c.json({
      slug: slug,
      likes: 0,
    });
  }

  return c.json({
    slug: slug,
    likes: Number(count) || 0,
  });
});

app.put("/pages/:slug/likes", async (c) => {
  const visitorId = c.req.header("x-fingerprintjs-id") || null;
  const { slug } = c.req.param();
  if (!slug) return c.json({ error: "Slug is required" }, 400);

  const count = await safeKV(() => c.env.LIKES.get(`like:${slug}`), null);
  const alreadyLiked = await safeKV(
    () => c.env.LIKES.get(`liked:${slug}:${visitorId}`),
    null,
  );

  if (alreadyLiked) {
    setCookie(c, `liked_${slug}`, "true", {});
    return c.json(
      {
        slug: slug,
        likes: count ? Number(count) || 0 : 0,
        message: "You have already liked this page.",
      },
      200,
    );
  }

  const likePromises = [
    safeKV(() => c.env.LIKES.put(`liked:${slug}:${visitorId}`, "true"), null),
  ];

  if (count) {
    likePromises.push(
      safeKV(
        () => c.env.LIKES.put(`like:${slug}`, (Number(count) + 1).toString()),
        null,
      ),
    );
  } else {
    likePromises.push(
      safeKV(() => c.env.LIKES.put(`like:${slug}`, "1"), null),
    );
  }

  await Promise.all(likePromises);

  setCookie(c, `liked_${slug}`, "true", {});
  return c.json({
    slug: slug,
    likes: Number(count) + 1 || 1,
  });
});

export const onRequest = handle(app);
