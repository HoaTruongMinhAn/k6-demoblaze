import {
  randomIntBetween,
  randomString,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

/**
 * Utility Helper Functions
 * Common helper functions used across test scenarios
 */

// Import test users data
const testUsersData = JSON.parse(open("../../data/test-users.json"));

/**
 * Generate a random wait time and sleep
 * @param {number} min - Minimum seconds to wait
 * @param {number} max - Maximum seconds to wait
 * @returns {number} Actual wait time used
 */
export function thinkTime(min = 1, max = 3) {
  const waitTime = randomIntBetween(min, max);
  return waitTime;
}

/**
 * Generate random test data
 * @returns {Object} Random test data
 */
export function generateTestData() {
  return {
    randomString: () => randomString(8),
    randomInt: (min, max) => randomIntBetween(min, max),
    randomEmail: () => `test_${randomString(8)}@example.com`,
    timestamp: () => Date.now(),
  };
}

/**
 * Format response for logging
 * @param {Response} response - HTTP response object
 * @returns {string} Formatted response string
 */
export function formatResponse(response) {
  return JSON.stringify(
    {
      status: response.status,
      statusText: response.status_text,
      duration: `${response.timings.duration}ms`,
      size: `${response.body.length} bytes`,
    },
    null,
    2
  );
}

/**
 * Log test execution details
 * @param {string} testName - Name of the test
 * @param {Object} details - Test details to log
 */
export function logTestExecution(testName, details) {
  console.log(`\n=== ${testName} ===`);
  Object.entries(details).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
}

/**
 * Create custom error message
 * @param {string} context - Error context
 * @param {Response} response - HTTP response object
 * @returns {string} Formatted error message
 */
export function createErrorMessage(context, response) {
  return `[${context}] Failed with status ${response.status}: ${response.body}`;
}

/**
 * Get an existing user from test data
 * @param {string} category - User category (e.g., 'customer', 'admin')
 * @param {number|null} index - Specific user index (0-based), or null for random selection
 * @returns {Object} User object with username and password
 */
export function getExistingUser(category = "customer", index = null) {
  const users = testUsersData.users[category];

  if (!users || users.length === 0) {
    throw new Error(`No users found in category: ${category}`);
  }

  // If index is provided, use it; otherwise pick randomly
  const userIndex =
    index !== null ? index : randomIntBetween(0, users.length - 1);
  const user = users[userIndex];

  if (!user) {
    throw new Error(
      `User not found at index ${userIndex} in category: ${category}`
    );
  }

  return user;
}
