import { configManager } from "../config/config-manager.js";
import {
  signUpAndValidate,
  loginAndValidate,
  signUpAndLoginWithValidation,
} from "../api/auth-api.js";
import { getExistingUser } from "../utils/test-data.js";
import { preActionDelay, betweenActionDelay } from "../utils/timing.js";

/**
 * Authentication Workflows
 * Reusable authentication scenarios following SRP
 * These workflows can be used across different test files
 */

/**
 * Signup workflow - Creates a new user and validates signup
 * @returns {Object} Created user object
 */
export function signupWorkflow() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);
  betweenActionDelay();
  return user;
}

/**
 * Login workflow - Logs in with an existing user and validates
 * @returns {Object} Login response with user info
 */
export function loginWorkflow() {
  preActionDelay();
  const user = getExistingUser("customer");
  const loginResponse = loginAndValidate(user);
  betweenActionDelay();
  return { user, loginResponse };
}

/**
 * Signup and login workflow - Creates new user, signs up, then logs in
 * @returns {Object} User and login response
 */
export function signupAndLoginWorkflow() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndLoginWithValidation(user);
  betweenActionDelay();
  return user;
}
