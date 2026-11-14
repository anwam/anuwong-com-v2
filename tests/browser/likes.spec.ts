import { expect, test } from "@playwright/test";

const post = "/blogs/2023/08/12-use-volta-to-lock-nodejs-version/";
const other = "/blogs/2023/09/05-how-to-find-files-with-fd/";

test.beforeEach(async ({ page }) => {
  // Exercise the fallback identity path without depending on fingerprint availability.
  await page.route(/fingerprint|fp\.esm/i, (route) => route.abort());
  await page.route("https://giscus.app/**", (route) => route.abort());
});

test("failed likes show retry, retain visitor identity, and block duplicate pending clicks", async ({
  page,
}) => {
  let writes = 0;
  const visitors: string[] = [];
  let finish: (() => void) | undefined;
  await page.route("**/api/pages/*/likes", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ json: { likes: 3, liked: false } });
    }
    writes++;
    visitors.push(route.request().headers()["x-visitor-id"]);
    if (writes === 1)
      return route.fulfill({ status: 503, json: { error: "Unavailable" } });
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
    await route.fulfill({ json: { likes: 4, liked: true } });
  });
  await page.goto(post);
  const button = page.getByRole("button", { name: "Like this post" });
  await expect(page.locator("#like-count")).toHaveText("3");
  await button.click();
  await expect(page.locator("#like-status")).toContainText("try again");
  await expect(button).toBeEnabled();
  await button.click();
  await expect(button).toBeDisabled();
  await expect.poll(() => writes).toBe(2);
  await button.dispatchEvent("click");
  expect(writes).toBe(2);
  expect(visitors[0]).toBeTruthy();
  expect(visitors[1]).toBe(visitors[0]);
  expect(
    await page.evaluate(() => localStorage.getItem("likes-visitor-id")),
  ).toBe(visitors[0]);
  finish!();
  await expect(page.locator("#like-count")).toHaveText("4");
  await expect(button).toBeDisabled();
  await expect(page.locator("#like-status")).toContainText("Thank you");
});

test("unavailable storage still permits a distinct fallback visitor", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Blocked");
      },
    });
  });
  let visitor: string | undefined;
  await page.route("**/api/pages/*/likes", (route) => {
    visitor = route.request().headers()["x-visitor-id"];
    return route.fulfill({ json: { likes: 0, liked: false } });
  });
  await page.goto(post);
  await expect(
    page.getByRole("button", { name: "Like this post" }),
  ).toBeEnabled();
  expect(visitor).toBeTruthy();
  expect(visitor).not.toBe("null");
});

test("a saved fallback stays the visitor identity when fingerprinting becomes available after reload", async ({
  page,
}) => {
  const liked = new Set<string>();
  const visitors: string[] = [];
  await page.route("**/api/pages/*/likes", (route) => {
    const visitor = route.request().headers()["x-visitor-id"];
    visitors.push(visitor);
    if (route.request().method() === "PUT") liked.add(visitor);
    return route.fulfill({
      json: { likes: liked.size, liked: liked.has(visitor) },
    });
  });
  await page.goto(post);
  const button = page.getByRole("button", { name: "Like this post" });
  await button.click();
  await expect(button).toBeDisabled();
  const saved = await page.evaluate(() =>
    localStorage.getItem("likes-visitor-id"),
  );
  expect(saved).toBeTruthy();
  await page.unroute(/fingerprint|fp\.esm/i);
  await page.reload();
  await expect.poll(() => visitors.length).toBe(3);
  expect(visitors[2]).toBe(saved);
  await expect(button).toBeDisabled();
});

test("a successful fingerprint remains the visitor identity if fingerprinting later fails", async ({
  page,
}) => {
  await page.unroute(/fingerprint|fp\.esm/i);
  const visitors: string[] = [];
  await page.route("**/api/pages/*/likes", (route) => {
    visitors.push(route.request().headers()["x-visitor-id"]);
    return route.fulfill({ json: { likes: 1, liked: true } });
  });
  await page.goto(post);
  await expect(page.locator("#like-count")).toHaveText("1");
  await page.route(/fingerprint|fp\.esm/i, (route) => route.abort());
  await page.reload();
  await expect.poll(() => visitors.length).toBe(2);
  expect(visitors[1]).toBe(visitors[0]);
});

test("initial reads keep submission disabled until authoritative liked state arrives", async ({
  page,
}) => {
  let release: (() => void) | undefined;
  let writes = 0;
  await page.route("**/api/pages/*/likes", async (route) => {
    if (route.request().method() === "PUT") {
      writes++;
      return route.fulfill({ json: { likes: 8, liked: true } });
    }
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    return route.fulfill({ json: { likes: 7, liked: true } });
  });
  await page.goto(post);
  await expect.poll(() => Boolean(release)).toBe(true);
  const button = page.getByRole("button", { name: "Like this post" });
  await expect(button).toBeDisabled();
  await button.dispatchEvent("click");
  expect(writes).toBe(0);
  release!();
  await expect(page.locator("#like-count")).toHaveText("7");
  await expect(button).toBeDisabled();
});

test("navigation cancels a pending submission and a stale reply cannot change the next post", async ({
  page,
}) => {
  let release: (() => void) | undefined;
  let pending = false;
  let aborted = false;
  page.on("requestfailed", (request) => {
    if (request.method() === "PUT" && request.url().endsWith("/likes"))
      aborted = true;
  });
  await page.route("**/api/pages/*/likes", async (route) => {
    if (route.request().method() === "PUT") {
      pending = true;
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({ json: { likes: 99, liked: true } }).catch(() => {});
      return;
    }
    return route.fulfill({ json: { likes: 2, liked: false } });
  });
  await page.goto(post);
  const marker = await page.evaluate(() => {
    (window as any).navigationMarker = "same document";
    return true;
  });
  expect(marker).toBe(true);
  await page.getByRole("button", { name: "Like this post" }).click();
  await expect.poll(() => pending).toBe(true);
  // Use the real router through a normal internal link.
  await page.evaluate((href) => {
    const a = document.createElement("a");
    a.href = href;
    a.id = "test-next";
    a.textContent = "next post";
    document.body.append(a);
  }, other);
  await page.locator("#test-next").click();
  await expect(page).toHaveURL(new RegExp(other));
  expect(await page.evaluate(() => (window as any).navigationMarker)).toBe(
    "same document",
  );
  await expect.poll(() => aborted).toBe(true);
  release!();
  await expect(page.locator("#like-count")).toHaveText("2");
  await expect(
    page.getByRole("button", { name: "Like this post" }),
  ).toBeEnabled();
});
