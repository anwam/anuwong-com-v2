import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4329" },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4329",
    url: "http://127.0.0.1:4329",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
