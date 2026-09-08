import { defineConfig, devices } from "@playwright/test";
import { AUTH_STATE_PATH, WEB_URL } from "./support/env";

/**
 * Playwright configuration for the Plane web app.
 *
 * The suite expects a running instance:
 *   - web app     at E2E_WEB_URL (default http://localhost:3000)
 *   - Django API  at E2E_API_URL (default http://localhost:8000)
 *
 * The `setup` project completes instance setup, signs up a fresh user through
 * the UI, walks the onboarding flow and stores the authenticated browser state.
 * All other projects depend on it and reuse that state.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }], ["github"]]
    : [["list"], ["html", { open: "never" }]],
  outputDir: "./test-results",
  use: {
    baseURL: WEB_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
    timezoneId: "UTC",
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATH,
      },
    },
  ],
});
