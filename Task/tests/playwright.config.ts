import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against the app at /app (served by webServer).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Vite emits the production build to /app/dist. `serve` is resolved out of
  // the symlinked /tests/node_modules (see Task/tests/test.sh).
  webServer: {
    command: "./node_modules/.bin/serve /app/dist -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
