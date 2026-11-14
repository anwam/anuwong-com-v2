import { expect, test } from "@playwright/test";

for (const preference of ["dark", "light"] as const) {
  test(`saved ${preference} applies before deferred scripts and survives swaps`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: preference === "dark" ? "light" : "dark",
    });
    await page.addInitScript(
      (theme) => localStorage.setItem("theme", theme),
      preference,
    );
    // Defer all external scripts: the inline head implementation must already apply theme.
    await page.route("**/*", (route) =>
      route.request().resourceType() === "script"
        ? route.abort()
        : route.continue(),
    );
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(
      await page
        .locator("html")
        .evaluate((el) => el.classList.contains("dark")),
    ).toBe(preference === "dark");
    await page.unroute("**/*");
    await page.reload();
    await page.evaluate(() => {
      (window as any).themeMarker = true;
    });
    for (const href of ["/blogs", "/tags", "/blogs"]) {
      await page.locator(`header a[href='${href}']`).first().click();
      await expect(page).toHaveURL(new RegExp(`${href}/?$`));
      expect(
        await page
          .locator("html")
          .evaluate((el) => el.classList.contains("dark")),
      ).toBe(preference === "dark");
    }
    expect(await page.evaluate(() => (window as any).themeMarker)).toBe(true);
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect
      .poll(() =>
        page.locator("html").evaluate((el) => el.classList.contains("dark")),
      )
      .toBe(preference !== "dark");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      preference === "dark" ? "light" : "dark",
    );
  });
}

test("system preference follows changes until the user chooses a theme", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("theme", "invalid"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("blocked storage permits toggling and preserves the choice during navigation", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Blocked");
      },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.stack ?? error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.locator("header a[href='/blogs']").click();
  await expect(page).toHaveURL(/\/blogs\/?$/);
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  expect(errors).toEqual([]);
});
