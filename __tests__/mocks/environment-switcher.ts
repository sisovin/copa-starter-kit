/**
 * Environment Switcher for Payment Gateway Mocks
 *
 * This module provides a utility for switching between environments
 * (development, staging, production) for the mock payment gateways.
 */

import { createPayWayMockServer } from "./payway-mock-server";
import { createBakongMockServer } from "./bakong-mock-server";

export type Environment = "development" | "staging" | "production";

// Default configuration for each environment
const environmentConfig = {
  development: {
    payway: {
      responseDelay: 100, // Fast responses
      invalidSignatureRate: 0, // No signature errors
      errorRate: 0, // No random errors
      webhookDelay: 500, // Fast webhooks
    },
    bakong: {
      responseDelay: 100, // Fast responses
      errorRate: 0, // No random errors
      qrFailureRate: 0, // No QR failures
      webhookDelay: 500, // Fast webhooks
    },
  },
  staging: {
    payway: {
      responseDelay: 500, // Moderate delays
      invalidSignatureRate: 0.05, // Occasional signature errors
      errorRate: 0.02, // Occasional random errors
      webhookDelay: 2000, // Moderate webhook delays
    },
    bakong: {
      responseDelay: 800, // Slightly slower responses
      errorRate: 0.02, // Occasional random errors
      qrFailureRate: 0.05, // Occasional QR failures
      webhookDelay: 3000, // Longer webhook delays
    },
  },
  production: {
    payway: {
      responseDelay: 1000, // Realistic delays
      invalidSignatureRate: 0, // No signature errors in prod
      errorRate: 0.01, // Rare random errors
      webhookDelay: 5000, // Realistic webhook delays
    },
    bakong: {
      responseDelay: 1200, // Realistic delays
      errorRate: 0.01, // Rare random errors
      qrFailureRate: 0.01, // Rare QR failures
      webhookDelay: 5000, // Realistic webhook delays
    },
  },
};

interface MockServers {
  payway: ReturnType<typeof createPayWayMockServer>;
  bakong: ReturnType<typeof createBakongMockServer>;
  environment: Environment;
  switchEnvironment: (env: Environment) => void;
  shutdown: () => void;
}

/**
 * Creates mock payment gateway servers with environment switching capability
 */
export function createMockServers(
  initialEnv: Environment = "development"
): MockServers {
  // Create servers with initial environment
  const payway = createPayWayMockServer(3100, {
    ...environmentConfig[initialEnv].payway,
    environment: initialEnv,
  });

  const bakong = createBakongMockServer(3200, {
    ...environmentConfig[initialEnv].bakong,
    environment: initialEnv,
  });

  // Function to switch environments
  function switchEnvironment(env: Environment) {
    // Update PayWay config
    payway.config = {
      ...payway.config,
      ...environmentConfig[env].payway,
      environment: env,
    };

    // Update Bakong config
    bakong.config = {
      ...bakong.config,
      ...environmentConfig[env].bakong,
      environment: env,
    };

    console.log(`[Environment Switcher] Switched to ${env} environment`);

    return { payway: payway.config, bakong: bakong.config };
  }

  // Function to shut down all servers
  function shutdown() {
    payway.server.close();
    bakong.server.close();
    console.log("[Environment Switcher] All mock servers shut down");
  }

  // Return the servers and control functions
  return {
    payway,
    bakong,
    environment: initialEnv,
    switchEnvironment,
    shutdown,
  };
}

/**
 * Creates additional test environments with specific behaviors
 *
 * @param baseEnvironment The environment to extend
 * @param customConfig Configuration overrides
 */
export function createCustomEnvironment(
  baseEnvironment: Environment = "development",
  customConfig: {
    payway?: Partial<MockServerConfig>;
    bakong?: Partial<MockServerConfig>;
    name?: string;
  }
): MockServerConfig {
  // Clone the base environment config
  const baseConfig = JSON.parse(
    JSON.stringify(environmentConfig[baseEnvironment])
  );

  // Apply custom configuration overrides
  return {
    payway: { ...baseConfig.payway, ...customConfig.payway },
    bakong: { ...baseConfig.bakong, ...customConfig.bakong },
    name: customConfig.name || `custom-${baseEnvironment}`,
  };
}

// Pre-configured test environments for specific test scenarios
export const testEnvironments = {
  // High error rate environment for error handling tests
  errorProne: createCustomEnvironment("staging", {
    payway: {
      errorRate: 0.3,
      invalidSignatureRate: 0.3,
      responseDelay: 2000,
    },
    bakong: {
      errorRate: 0.3,
      qrFailureRate: 0.3,
      responseDelay: 2500,
    },
    name: "error-prone",
  }),

  // Slow responses environment for timeout testing
  slowResponse: createCustomEnvironment("production", {
    payway: {
      responseDelay: 5000,
      webhookDelay: 10000,
    },
    bakong: {
      responseDelay: 5000,
      webhookDelay: 12000,
    },
    name: "slow-response",
  }),

  // Mixed environment for realistic testing
  mixed: createCustomEnvironment("staging", {
    payway: {
      responseDelay: 800,
      errorRate: 0.05,
      invalidSignatureRate: 0.1,
      webhookDelay: 3000,
    },
    bakong: {
      responseDelay: 1000,
      errorRate: 0.08,
      qrFailureRate: 0.2,
      webhookDelay: 4000,
    },
    name: "mixed",
  }),
};

// Extend the createMockServers function to support custom environments
export function createMockServersWithConfig(initialConfig: any): MockServers {
  // Create servers with custom configuration
  const payway = createPayWayMockServer(3100, {
    ...initialConfig.payway,
  });

  const bakong = createBakongMockServer(3200, {
    ...initialConfig.bakong,
  });

  // Function to switch environments
  function switchEnvironment(env: Environment | string) {
    let newConfig;

    // Check if it's a standard environment or custom
    if (env in environmentConfig) {
      newConfig = environmentConfig[env as Environment];
    } else if (env in testEnvironments) {
      newConfig = testEnvironments[env as keyof typeof testEnvironments];
    } else {
      throw new Error(`Unknown environment: ${env}`);
    }

    // Update PayWay config
    payway.config = {
      ...payway.config,
      ...newConfig.payway,
    };

    // Update Bakong config
    bakong.config = {
      ...bakong.config,
      ...newConfig.bakong,
    };

    console.log(`[Environment Switcher] Switched to ${env} environment`);
  }

  // Function to shut down all servers
  function shutdown() {
    payway.server?.close();
    bakong.server?.close();
    console.log("[Environment Switcher] All mock servers shut down");
  }

  return {
    payway,
    bakong,
    environment: initialConfig.name || "custom",
    switchEnvironment,
    shutdown,
  };
}

// Example usage when run directly
if (require.main === module) {
  const mockServers = createMockServers();
  console.log(`Started mock servers in ${mockServers.environment} mode`);
  console.log("To switch environments:");
  console.log(
    '  - Development: curl -X POST http://localhost:3100/admin/config -d \'{"environment":"development"}\''
  );
  console.log(
    '  - Staging: curl -X POST http://localhost:3100/admin/config -d \'{"environment":"staging"}\''
  );
  console.log(
    '  - Production: curl -X POST http://localhost:3100/admin/config -d \'{"environment":"production"}\''
  );

  // Keep the process running
  console.log("Press Ctrl+C to shut down servers");
}
