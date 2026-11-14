import assert from "node:assert/strict";
import test from "node:test";
import type { KVNamespace } from "@cloudflare/workers-types";
import { app } from "../functions/api/[[route]].ts";

function storage(rateLimited = false) {
  const values = new Map<string, string>();
  const lastWrite = new Map<string, number>();
  let failure: "read" | "receipt" | "count" | "complete" | undefined;
  const kv = {
    async get(key: string) {
      if (failure === "read") throw new Error("private storage details");
      return values.get(key) ?? null;
    },
    async put(key: string, value: string) {
      if (rateLimited && Date.now() - (lastWrite.get(key) ?? 0) < 1000)
        throw new Error("KV write rate exceeded");
      if (
        (failure === "receipt" && key.startsWith("like-pending:")) ||
        (failure === "count" && key.startsWith("like:")) ||
        (failure === "complete" && key.startsWith("liked:") && value === "true")
      ) {
        throw new Error("private storage details");
      }
      values.set(key, value);
      lastWrite.set(key, Date.now());
    },
  };
  return {
    values,
    kv: kv as unknown as KVNamespace,
    fail: (value?: typeof failure) => {
      failure = value;
    },
  };
}

const put = { method: "PUT", headers: { "X-Visitor-Id": "visitor-a" } };

test("first and repeated likes preserve counts, receipt and cookie contract", async () => {
  const { kv, values } = storage();
  const env = { LIKES: kv, PAGE_VIEW: kv };
  const first = await app.request("/api/pages/post/likes", put, env);
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { slug: "post", likes: 1, liked: true });
  assert.match(first.headers.get("set-cookie")!, /liked_post=true.*Path=\//);
  const repeat = await app.request("/api/pages/post/likes", put, env);
  assert.equal(repeat.status, 200);
  assert.equal((await repeat.json()).likes, 1);
  assert.equal(values.get("like:post"), "1");
  assert.equal(values.get("liked:post:visitor-a"), "true");
  const read = await app.request(
    "/api/pages/post/likes",
    { headers: put.headers },
    env,
  );
  assert.deepEqual(await read.json(), { slug: "post", likes: 1, liked: true });
});

test("a first like succeeds with KV's one-write-per-key-per-second limit", async () => {
  const { kv } = storage(true);
  const env = { LIKES: kv, PAGE_VIEW: kv };
  const first = await app.request("/api/pages/post/likes", put, env);
  assert.equal(first.status, 200);
  assert.equal((await first.json()).likes, 1);
  const repeat = await app.request("/api/pages/post/likes", put, env);
  assert.equal(repeat.status, 200);
  assert.equal((await repeat.json()).likes, 1);
});

test("absent visitor identity is rejected without a shared null receipt", async () => {
  const { kv, values } = storage();
  const response = await app.request(
    "/api/pages/post/likes",
    { method: "PUT" },
    { LIKES: kv, PAGE_VIEW: kv },
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(values.size, 0);
});

test("missing binding and failed reads return non-leaky errors", async () => {
  const missing = await app.request("/api/pages/post/likes", put, {});
  assert.equal(missing.status, 503);
  const { kv, fail } = storage();
  fail("read");
  for (const init of [{}, put]) {
    const response = await app.request("/api/pages/post/likes", init, {
      LIKES: kv,
      PAGE_VIEW: kv,
    });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("set-cookie"), null);
    assert.doesNotMatch(await response.text(), /private storage/);
  }
});

for (const failure of ["receipt", "count", "complete"] as const) {
  test(`failed ${failure} write returns an error and retry completes one like`, async () => {
    const { kv, values, fail } = storage(true);
    const env = { LIKES: kv, PAGE_VIEW: kv };
    fail(failure);
    const response = await app.request("/api/pages/post/likes", put, env);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("set-cookie"), null);
    fail();
    const retried = await app.request("/api/pages/post/likes", put, env);
    assert.equal(retried.status, 200);
    assert.equal((await retried.json()).likes, 1);
    assert.equal(values.get("like:post"), "1");
    assert.equal(values.get("liked:post:visitor-a"), "true");
  });
}

test("missing counts are read without writes; corrupt counts are not overwritten", async () => {
  const { kv, values } = storage();
  const env = { LIKES: kv, PAGE_VIEW: kv };
  const response = await app.request("/api/pages/post/likes", {}, env);
  assert.deepEqual(await response.json(), {
    slug: "post",
    likes: 0,
    liked: false,
  });
  assert.equal(values.size, 0);
  for (const count of [
    "not-a-number",
    "-1",
    "Infinity",
    "1.5",
    "9007199254740991",
  ]) {
    values.set("like:post", count);
    const response = await app.request("/api/pages/post/likes", put, env);
    assert.equal(response.status, 503);
    assert.equal(values.get("like:post"), count);
  }
});

test("legacy visitor headers and stored true receipts still deduplicate", async () => {
  const { kv, values } = storage();
  values.set("like:post", "7");
  values.set("liked:post:old-visitor", "true");
  const response = await app.request(
    "/api/pages/post/likes",
    { method: "PUT", headers: { "x-fingerprintjs-id": "old-visitor" } },
    { LIKES: kv, PAGE_VIEW: kv },
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).likes, 7);
});

test("the last safe increment stays readable and repeated while further increments are rejected", async () => {
  const { kv, values } = storage();
  const env = { LIKES: kv, PAGE_VIEW: kv };
  values.set("like:post", "9007199254740990");
  const first = await app.request("/api/pages/post/likes", put, env);
  assert.equal(first.status, 200);
  assert.equal((await first.json()).likes, 9007199254740991);
  const repeat = await app.request("/api/pages/post/likes", put, env);
  assert.equal(repeat.status, 200);
  const read = await app.request("/api/pages/post/likes", {}, env);
  assert.equal(read.status, 200);
  const overflow = await app.request(
    "/api/pages/post/likes",
    { method: "PUT", headers: { "X-Visitor-Id": "new-visitor" } },
    env,
  );
  assert.equal(overflow.status, 503);
  assert.equal(values.has("liked:post:new-visitor"), false);
});

test("Thai post IDs keep their storage key and receive a valid success cookie", async () => {
  const { kv, values } = storage();
  const slug = "2025-10-redis-บันทึก";
  const response = await app.request(
    `/api/pages/${encodeURIComponent(slug)}/likes`,
    put,
    { LIKES: kv, PAGE_VIEW: kv },
  );
  assert.equal(response.status, 200);
  assert.equal(values.get(`like:${slug}`), "1");
  assert.equal((await response.json()).liked, true);
  assert.match(response.headers.get("set-cookie")!, /^liked_[\x21-\x7e]+/);
});

test("existing page-view routes retain their successful count response", async () => {
  const { kv } = storage();
  const env = { LIKES: kv, PAGE_VIEW: kv };
  const write = await app.request(
    "/api/pages/post/views",
    { method: "PUT" },
    env,
  );
  assert.deepEqual(await write.json(), { slug: "post", count: 1 });
  const read = await app.request("/api/pages/post/views", {}, env);
  assert.deepEqual(await read.json(), { slug: "post", count: 1 });
});
