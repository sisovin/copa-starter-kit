import { test } from "@playwright/test";
import { createMockServers } from "../mocks/environment-switcher";

/**
 * Global setup for the Playwright tests
 *
 * This script starts the mock payment servers before tests run.
 */
async function globalSetup() {
  // Start mock servers
  const mockServers = createMockServers("development");

  // Store the mock servers in global state for tests to access
  global.__MOCK_SERVERS__ = mockServers;

  console.log("Mock payment servers started:");
  console.log(` - PayWay: http://localhost:3100 (${mockServers.environment})`);
  console.log(` - Bakong: http://localhost:3200 (${mockServers.environment})`);
}

/**
 * Global teardown for the Playwright tests
 *
 * This script stops the mock payment servers after tests complete.
 */
async function globalTeardown() {
  // Shut down mock servers
  if (global.__MOCK_SERVERS__) {
    global.__MOCK_SERVERS__.shutdown();
    console.log("Mock payment servers shut down");
  }
}

export { globalSetup, globalTeardown };
