import {
  randomIntBetween,
  randomString,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

/**
 * Test Data Utilities
 * Functions for generating and retrieving test data
 */

// Import test users data
const testUsersData = JSON.parse(open("../../data/test-users.json"));

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
