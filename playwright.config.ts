import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Playwright configuration for E2E payment gateway tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory and matching pattern
  testDir: "./__tests__/e2e",
  testMatch: "**/*.spec.ts",

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Expect timeout for assertions
  expect: {
    timeout: 5000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retries for flaky tests in CI
  retries: process.env.CI ? 2 : 0,

  // Workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ["html", { outputFolder: "test-results/html" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  // Global setup/teardown
  globalSetup: require.resolve("./__tests__/e2e/global-setup.ts"),

  // Projects for different test setups
  projects: [
    // Setup project - runs first to handle dependency installation
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },

    // Tests with desktop Chrome
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3000",
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
      },
      dependencies: ["setup"],
    },

    // Tests with mobile Safari
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 13"],
        baseURL: "http://localhost:3000",
        screenshot: "only-on-failure",
      },
      testMatch: /mobile-viewport\.spec\.ts/,
      dependencies: ["setup"],
    },

    // Accessibility tests
    {
      name: "Accessibility",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3000",
        screenshot: "on",
        launchOptions: {
          args: ["--disable-web-security"],
        },
      },
      testMatch: /accessibility\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],

  // Web server to use
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },

  // Use the same directory for test artifacts
  outputDir: "test-results/",
});
