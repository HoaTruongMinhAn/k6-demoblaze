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
 *
 * @type {Object.<string, {vus: number, duration: string}>}
 */
export const TEST_PROFILES = {
  /** Quick validation - Minimal load to verify system is functional */
  smoke: {
    vus: 1,
    duration: "5s",
  },

  /** Business workflow validation - Low load for testing features */
  functional: {
    vus: 2,
    duration: "5s",
  },

  /** Expected production load - Simulate normal traffic patterns */
  load: {
    vus: 3,
    duration: "10s",
  },

  /** Beyond expected load - Push system to find breaking points */
  stress: {
    vus: 4,
    duration: "10s",
  },

  /** Sudden traffic spike - Test system behavior under rapid load increase */
  spike: {
    vus: 5,
    duration: "3s",
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
