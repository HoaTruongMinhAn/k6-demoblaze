import {
  randomIntBetween,
  randomString,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { User } from "../models/User.js";

/**
 * Test Data Utilities
 * Functions for generating and retrieving test data
 */

// Import test users data
const testUsersData = JSON.parse(open("../../data/user.json"));

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
 * @returns {User} User instance
 */
export function getExistingUser(category = "customer", index = null) {
  const users = testUsersData.users[category];

  if (!users || users.length === 0) {
    throw new Error(`No users found in category: ${category}`);
  }

  // If index is provided, use it; otherwise pick randomly
  const userIndex =
    index !== null ? index : randomIntBetween(0, users.length - 1);
  const userData = users[userIndex];

  if (!userData) {
    throw new Error(
      `User not found at index ${userIndex} in category: ${category}`
    );
  }

  return User.fromObject({ ...userData, category });
}

/**
 * Get an existing user as a plain object (for backward compatibility)
 * @param {string} category - User category (e.g., 'customer', 'admin')
 * @param {number|null} index - Specific user index (0-based), or null for random selection
 * @returns {Object} User object with username and password
 */
export function getExistingUserObject(category = "customer", index = null) {
  const user = getExistingUser(category, index);
  return user.toObject();
}

/**
 * Create a new random user for testing
 * @param {string} category - User category (e.g., 'customer', 'admin')
 * @param {string} usernamePrefix - Prefix for username
 * @returns {User} New User instance
 */
export function createRandomUser(
  category = "customer",
  usernamePrefix = "test_"
) {
  return User.createRandom(category, usernamePrefix);
}

/**
 * Create multiple random users for testing
 * @param {number} count - Number of users to create
 * @param {string} category - User category (e.g., 'customer', 'admin')
 * @param {string} usernamePrefix - Prefix for username
 * @returns {User[]} Array of User instances
 */
export function createRandomUsers(
  count,
  category = "customer",
  usernamePrefix = "test_"
) {
  return User.createRandomBatch(count, category, usernamePrefix);
}

/**
 * Get all users from a specific category
 * @param {string} category - User category (e.g., 'customer', 'admin')
 * @returns {User[]} Array of User instances
 */
export function getAllUsers(category) {
  const users = testUsersData.users[category];

  if (!users || users.length === 0) {
    throw new Error(`No users found in category: ${category}`);
  }

  return users.map((userData) => User.fromObject({ ...userData, category }));
}
