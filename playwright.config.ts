import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  use: {
    baseURL: "http://127.0.0.1:4178",
    browserName: "chromium",
  },
  webServer: {
    command: "node scripts/browser-server.mjs",
    url: "http://127.0.0.1:4178/health",
    reuseExistingServer: !process.env.CI,
  },
});
