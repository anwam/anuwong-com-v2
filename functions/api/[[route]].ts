import type { KVNamespace } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { setCookie } from "hono/cookie";

type Bindings = {
	PAGE_VIEW: KVNamespace;
	LIKES: KVNamespace;
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

app.get("/pages/:slug/likes", async (c) => {
	const { slug } = c.req.param();
	const count = await c.env.LIKES.get(`like:${slug}`);

	if (count === null) {
		await c.env.LIKES.put(`like:${slug}`, "0");
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

	const count = await c.env.LIKES.get(`like:${slug}`);
	const alreadyLiked = await c.env.LIKES.get(`liked:${slug}:${visitorId}`);
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

	const likePromises = [c.env.LIKES.put(`liked:${slug}:${visitorId}`, "true")];
	if (count) {
		likePromises.push(
			c.env.LIKES.put(`like:${slug}`, (Number(count) + 1).toString()),
		);
	} else {
		likePromises.push(c.env.LIKES.put(`like:${slug}`, "1"));
	}

	await Promise.all(likePromises);

	setCookie(c, `liked_${slug}`, "true", {});
	return c.json({
		slug: slug,
		likes: Number(count) + 1 || 1,
	});
});

export const onRequest = handle(app);
