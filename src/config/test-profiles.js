import { configManager } from "./config-manager.js";

/**
 * Test Profiles Configuration
 *
 * Single source of truth for all test execution profiles.
 * Tests import profiles directly from this file.
 *
 * @example
 * import { getTestProfile } from "../../src/config/test-profiles.js";
 * const profile = getTestProfile("smoke");
 */

/**
 * Test execution profiles for different test types
 *
 * Each profile defines:
 * - vus: Number of virtual users (concurrent connections)
 * - duration: How long the test should run
 * - thresholds: Performance criteria that must be met
 *
 * @type {Object.<string, {projectId: number, vus: number, duration: string, thresholds: Object}>}
 */
export const TEST_PROFILES = {
  /** Quick validation - Minimal load to verify system is functional */
  smoke: {
    vus: 1,
    iterations: 1,
    thresholds: {
      http_req_duration: ["p(95)<1000"], // 95% of requests under 1s
      http_req_failed: ["rate<0.05"], // Less than 5% errors
      checks: ["rate>0.95"], // More than 95% checks pass
    },
    cloud: {
      projectID: configManager.getProjectInfo().projectId,
    },
  },

  /** Business workflow validation - Low load for testing features */
  functional: {
    projectId: configManager.getProjectInfo().projectId,
    vus: 2,
    duration: "5s",
    thresholds: {
      http_req_duration: ["p(95)<1000", "p(99)<1200", "max<2000"], // Stricter for functional tests
      http_req_failed: ["rate<0.01"], // Less than 1% errors
      checks: ["rate>0.95"], // More than 95% checks pass
    },
    cloud: {
      projectID: configManager.getProjectInfo().projectId,
    },
  },

  /** Expected production load - Simulate normal traffic patterns */
  load: {
    projectId: configManager.getProjectInfo().projectId,
    vus: 3,
    duration: "10s",
    thresholds: {
      http_req_duration: ["p(95)<2000", "p(99)<3000"], // More lenient under load
      http_req_failed: ["rate<0.05"], // Up to 5% errors acceptable
      checks: ["rate>0.90"], // 90% checks pass
    },
    cloud: {
      projectID: configManager.getProjectInfo().projectId,
    },
  },

  /** Beyond expected load - Push system to find breaking points */
  stress: {
    projectId: configManager.getProjectInfo().projectId,
    vus: 4,
    duration: "10s",
    thresholds: {
      http_req_duration: ["p(95)<5000"], // Very lenient - finding limits
      http_req_failed: ["rate<0.10"], // Up to 10% errors expected
      checks: ["rate>0.80"], // 80% checks pass
    },
    cloud: {
      projectID: configManager.getProjectInfo().projectId,
    },
  },

  /** Sudden traffic spike - Test system behavior under rapid load increase */
  spike: {
    projectId: configManager.getProjectInfo().projectId,
    vus: 5,
    duration: "3s",
    thresholds: {
      http_req_duration: ["p(95)<3000"], // Allow for spike impact
      http_req_failed: ["rate<0.10"], // Some failures expected during spike
      checks: ["rate>0.85"], // 85% checks pass
    },
    cloud: {
      projectID: configManager.getProjectInfo().projectId,
    },
  },

  /** Mixed user behavior - Realistic traffic patterns with different user flows */
  mix: {
    projectId: configManager.getProjectInfo().projectId,
    vus: 5,
    duration: "5s",
    thresholds: {
      http_req_duration: ["p(95)<2000", "p(99)<3000"], // Balanced performance expectations
      http_req_failed: ["rate<0.05"], // Up to 5% errors acceptable
      checks: ["rate>0.90"], // 90% checks pass
    },
    cloud: {
      projectID: configManager.getProjectInfo().projectId,
    },
  },
};

/**
 * Scenario Distribution Profiles
 *
 * Defines different distribution patterns for mix scenarios.
 * Each profile specifies how VUs are distributed across different user flows.
 *
 * @type {Object.<string, {scenarios: Object.<string, {weight: number, description: string}>}>}
 */
export const DISTRIBUTION_PROFILES = {
  /** Basic authentication flow - Current implementation */
  auth_basic: {
    scenarios: {
      signup_only: {
        weight: 2,
        description: "New users who abandon after signup",
      },
      login_only: { weight: 2, description: "Returning users" },
      signup_and_login: {
        weight: 6,
        description: "New users completing full flow",
      },
    },
  },

  /** E-commerce focused - More shopping behaviors */
  ecommerce: {
    scenarios: {
      signup_only: {
        weight: 1,
        description: "New users who abandon after signup",
      },
      login_only: { weight: 3, description: "Returning users" },
      signup_and_login: {
        weight: 4,
        description: "New users completing full flow",
      },
      view_cart: { weight: 2, description: "Users viewing their cart" },
      add_to_cart: { weight: 3, description: "Users adding items to cart" },
      place_order: { weight: 2, description: "Users completing purchases" },
    },
  },

  /** High conversion - Optimized for purchase completion */
  high_conversion: {
    scenarios: {
      signup_only: {
        weight: 1,
        description: "New users who abandon after signup",
      },
      login_only: { weight: 2, description: "Returning users" },
      signup_and_login: {
        weight: 3,
        description: "New users completing full flow",
      },
      view_cart: { weight: 1, description: "Users viewing their cart" },
      add_to_cart: { weight: 4, description: "Users adding items to cart" },
      place_order: { weight: 5, description: "Users completing purchases" },
    },
  },

  /** Browse-heavy - Users mostly browsing */
  browse_heavy: {
    scenarios: {
      signup_only: {
        weight: 3,
        description: "New users who abandon after signup",
      },
      login_only: { weight: 4, description: "Returning users" },
      signup_and_login: {
        weight: 2,
        description: "New users completing full flow",
      },
      view_cart: { weight: 3, description: "Users viewing their cart" },
      add_to_cart: { weight: 1, description: "Users adding items to cart" },
      place_order: { weight: 1, description: "Users completing purchases" },
    },
  },

  /** Load testing - Equal distribution for stress testing */
  load_test: {
    scenarios: {
      signup_only: {
        weight: 1,
        description: "New users who abandon after signup",
      },
      login_only: { weight: 1, description: "Returning users" },
      signup_and_login: {
        weight: 1,
        description: "New users completing full flow",
      },
      view_cart: { weight: 1, description: "Users viewing their cart" },
      add_to_cart: { weight: 1, description: "Users adding items to cart" },
      place_order: { weight: 1, description: "Users completing purchases" },
    },
  },
};

/**
 * Environment configurations for different deployment stages
 *
 * Each environment defines:
 * - baseUrl: API base URL for that environment
 * - timeout: Request timeout specific to that environment
 *
 * @type {Object.<string, {baseUrl: string, timeout: string}>}
 */
export const ENVIRONMENTS = {
  /** Development environment - For active development */
  dev: {
    baseUrl: "https://api-dev.demoblaze.com",
    timeout: "30s",
  },

  /** System Integration Testing - Default test environment */
  sit: {
    baseUrl: "https://api.demoblaze.com",
    timeout: "30s",
  },

  /** User Acceptance Testing - Pre-production validation */
  uat: {
    baseUrl: "https://api-uat.demoblaze.com",
    timeout: "20s",
  },

  /** Production - Live environment (use with caution!) */
  prod: {
    baseUrl: "https://api-prod.demoblaze.com",
    timeout: "15s",
  },
};

/**
 * Get test profile by name
 * @param {string} profileName - Profile name (smoke, load, stress, spike)
 * @returns {Object} Test profile configuration
 */
export function getTestProfile(profileName) {
  const profile = TEST_PROFILES[profileName];
  if (!profile) {
    throw new Error(
      `Test profile "${profileName}" not found. Available: ${Object.keys(
        TEST_PROFILES
      ).join(", ")}`
    );
  }
  return profile;
}

/**
 * Get environment configuration by name
 * @param {string} envName - Environment name (dev, sit, uat, prod)
 * @returns {Object} Environment configuration
 */
export function getEnvironment(envName) {
  const env = ENVIRONMENTS[envName];
  if (!env) {
    throw new Error(
      `Environment "${envName}" not found. Available: ${Object.keys(
        ENVIRONMENTS
      ).join(", ")}`
    );
  }
  return env;
}

/**
 * Get distribution profile by name
 * @param {string} profileName - Distribution profile name
 * @returns {Object} Distribution profile configuration
 */
export function getDistributionProfile(profileName) {
  const profile = DISTRIBUTION_PROFILES[profileName];
  if (!profile) {
    throw new Error(
      `Distribution profile "${profileName}" not found. Available: ${Object.keys(
        DISTRIBUTION_PROFILES
      ).join(", ")}`
    );
  }
  return profile;
}

/**
 * Calculate VU distribution based on scenario weights
 * @param {Object} distributionProfile - Distribution profile with scenarios and weights
 * @param {number} totalVUs - Total number of virtual users
 * @returns {Object} VU distribution per scenario
 */
export function calculateVUDistribution(distributionProfile, totalVUs) {
  const scenarios = distributionProfile.scenarios;
  const totalWeight = Object.values(scenarios).reduce(
    (sum, scenario) => sum + scenario.weight,
    0
  );

  const distribution = {};
  let allocatedVUs = 0;

  // Calculate VUs for each scenario
  Object.entries(scenarios).forEach(([scenarioName, scenarioConfig], index) => {
    const percentage = scenarioConfig.weight / totalWeight;
    const calculatedVUs = Math.round(totalVUs * percentage);

    // For the last scenario, allocate remaining VUs to ensure total matches
    if (index === Object.keys(scenarios).length - 1) {
      distribution[scenarioName] = totalVUs - allocatedVUs;
    } else {
      distribution[scenarioName] = calculatedVUs;
      allocatedVUs += calculatedVUs;
    }
  });

  return distribution;
}

/**
 * Generate K6 scenarios configuration from distribution profile
 * @param {Object} distributionProfile - Distribution profile with scenarios and weights
 * @param {number} totalVUs - Total number of virtual users
 * @param {string} duration - Test duration
 * @param {Object} thresholds - Performance thresholds
 * @returns {Object} K6 scenarios configuration
 */
export function generateScenariosConfig(
  distributionProfile,
  totalVUs,
  duration,
  thresholds
) {
  const vusDistribution = calculateVUDistribution(
    distributionProfile,
    totalVUs
  );
  const scenarios = {};

  Object.entries(distributionProfile.scenarios).forEach(
    ([scenarioName, scenarioConfig]) => {
      const vus = vusDistribution[scenarioName];
      if (vus > 0) {
        // Convert scenario name to camelCase function name
        const functionName = scenarioName.replace(
          /_([a-z])/g,
          (match, letter) => letter.toUpperCase()
        );

        scenarios[scenarioName] = {
          executor: "constant-vus",
          exec: functionName,
          vus: vus,
          duration: duration,
          tags: { scenario: scenarioName },
        };
      }
    }
  );

  return {
    scenarios,
    thresholds,
    tags: {
      test_type: "mix",
      feature: "dynamic_distribution",
      distribution_profile: Object.keys(DISTRIBUTION_PROFILES).find(
        (key) => DISTRIBUTION_PROFILES[key] === distributionProfile
      ),
    },
  };
}
