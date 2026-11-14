import type { KVNamespace } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { setCookie } from "hono/cookie";
import {
  likePost,
  readPostLikes,
  validVisitor,
} from "../../src/modules/blog/postLikes.ts";

type Bindings = {
  PAGE_VIEW: KVNamespace;
  LIKES: KVNamespace;
};

export const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

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
  const visitor =
    validVisitor(c.req.header("x-fingerprintjs-id")) ||
    validVisitor(c.req.header("x-visitor-id"));
  c.header("Cache-Control", "no-store");
  try {
    return c.json(await readPostLikes(c.env.LIKES, slug, visitor));
  } catch {
    return c.json(
      { error: "Likes are temporarily unavailable. Please try again." },
      503,
    );
  }
});

app.put("/pages/:slug/likes", async (c) => {
  const { slug } = c.req.param();
  const visitor =
    validVisitor(c.req.header("x-fingerprintjs-id")) ||
    validVisitor(c.req.header("x-visitor-id"));
  c.header("Cache-Control", "no-store");
  if (!visitor) return c.json({ error: "A visitor ID is required." }, 400);
  try {
    const result = await likePost(c.env.LIKES, slug, visitor);
    setCookie(c, `liked_${encodeURIComponent(slug)}`, "true", {
      path: "/",
      sameSite: "Lax",
      secure: new URL(c.req.url).protocol === "https:",
    });
    return c.json(result);
  } catch {
    return c.json(
      { error: "Your like could not be saved. Please try again." },
      503,
    );
  }
});

export const onRequest = handle(app);
