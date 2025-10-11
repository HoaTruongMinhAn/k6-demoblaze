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
 * @type {Object.<string, {vus: number, duration: string, thresholds: Object}>}
 */
export const TEST_PROFILES = {
  /** Quick validation - Minimal load to verify system is functional */
  smoke: {
    vus: 1,
    duration: "5s",
    thresholds: {
      http_req_duration: ["p(95)<1000"], // 95% of requests under 1s
      http_req_failed: ["rate<0.05"], // Less than 5% errors
      checks: ["rate>0.95"], // More than 95% checks pass
    },
  },

  /** Business workflow validation - Low load for testing features */
  functional: {
    vus: 2,
    duration: "5s",
    thresholds: {
      http_req_duration: ["p(95)<500", "p(99)<1000", "max<2000"], // Stricter for functional tests
      http_req_failed: ["rate<0.01"], // Less than 1% errors
      checks: ["rate>0.95"], // More than 95% checks pass
    },
  },

  /** Expected production load - Simulate normal traffic patterns */
  load: {
    vus: 3,
    duration: "10s",
    thresholds: {
      http_req_duration: ["p(95)<2000", "p(99)<3000"], // More lenient under load
      http_req_failed: ["rate<0.05"], // Up to 5% errors acceptable
      checks: ["rate>0.90"], // 90% checks pass
    },
  },

  /** Beyond expected load - Push system to find breaking points */
  stress: {
    vus: 4,
    duration: "10s",
    thresholds: {
      http_req_duration: ["p(95)<5000"], // Very lenient - finding limits
      http_req_failed: ["rate<0.10"], // Up to 10% errors expected
      checks: ["rate>0.80"], // 80% checks pass
    },
  },

  /** Sudden traffic spike - Test system behavior under rapid load increase */
  spike: {
    vus: 5,
    duration: "3s",
    thresholds: {
      http_req_duration: ["p(95)<3000"], // Allow for spike impact
      http_req_failed: ["rate<0.10"], // Some failures expected during spike
      checks: ["rate>0.85"], // 85% checks pass
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
