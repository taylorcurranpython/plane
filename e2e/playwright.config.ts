import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: new URL(".env", import.meta.url).pathname });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests",
  // Auth specs mutate server-side state (sessions, users), so run them serially.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  outputDir: "./test-results",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "setup", testDir: ".", testMatch: /global\.setup\.ts/ },
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, dependencies: ["setup"] },
    ...(process.env.E2E_ALL_BROWSERS
      ? [
          { name: "firefox", use: { ...devices["Desktop Firefox"] }, dependencies: ["setup"] },
          { name: "webkit", use: { ...devices["Desktop Safari"] }, dependencies: ["setup"] },
        ]
      : []),
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        // Builds and serves the production client bundle via `serve`. Set
        // PLAYWRIGHT_WEB_SERVER_COMMAND="pnpm --filter=web start" to reuse an existing build.
        command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? "pnpm --filter=web preview",
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 300_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
