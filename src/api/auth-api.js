import http from "k6/http";
import { check } from "k6";
import { configManager } from "../config/config-manager.js";
import { CONSTANTS } from "../config/constants.js";
import { User } from "../models/User.js";

/**
 * Authentication API Module
 * Handles all authentication-related API calls
 */

/**
 * Sign up a new user
 * @param {User} user - The User object to register
 * @returns {Response} HTTP response object
 */
export function signUp(user) {
  if (!(user instanceof User)) {
    throw new Error("signUp requires a User object");
  }

  const url = configManager.getApiUrl("SIGN_UP");
  const payload = JSON.stringify(user.toObject());

  const params = {
    headers: {
      "Content-Type": CONSTANTS.CONTENT_TYPES.APPLICATION_JSON,
    },
  };

  return http.post(url, payload, params);
}

/**
 * Sign up a new user with username and password (for backward compatibility)
 * @param {string} username - The username to register
 * @param {string} password - The password for the user
 * @returns {Response} HTTP response object
 */
export function signUpWithCredentials(username, password) {
  const user = new User(username, password, "customer");
  return signUp(user);
}

/**
 * Login with existing user
 * @param {User} user - The User object to login
 * @returns {Response} HTTP response object
 */
export function login(user) {
  if (!(user instanceof User)) {
    throw new Error("login requires a User object");
  }

  const url = configManager.getApiUrl("LOGIN");
  const payload = JSON.stringify(user.toObject());

  const params = {
    headers: {
      "Content-Type": CONSTANTS.CONTENT_TYPES.APPLICATION_JSON,
    },
  };

  return http.post(url, payload, params);
}

/**
 * Login with username and password (for backward compatibility)
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Response} HTTP response object
 */
export function loginWithCredentials(username, password) {
  const user = new User(username, password, "customer");
  return login(user);
}

/**
 * Sign up a user and validate the response
 * @param {User} user - The User object to register
 * @param {Object} options - Validation options
 * @param {boolean} options.validateResponse - Whether to validate the response (default: true)
 * @param {string} options.testName - Custom test name for validation
 * @returns {Object} Object containing response and validation results
 */
export function signUpAndValidate(user, options = {}) {
  const { validateResponse = true, testName = "sign-up" } = options;

  if (!(user instanceof User)) {
    throw new Error("signUpAndValidate requires a User object");
  }

  const response = signUp(user);

  if (!validateResponse) {
    return { response, validationPassed: null };
  }

  const validationResults = check(response, {
    [`${testName} successful (status 200)`]: (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    [`${testName} response body is empty string`]: (r) =>
      r.body.trim() === '""',
  });

  return { response, validationPassed: validationResults };
}

/**
 * Login a user and validate the response
 * @param {User} user - The User object to login
 * @param {Object} options - Validation options
 * @param {boolean} options.validateResponse - Whether to validate the response (default: true)
 * @param {string} options.testName - Custom test name for validation
 * @returns {Object} Object containing response and validation results
 */
export function loginAndValidate(user, options = {}) {
  const { validateResponse = true, testName = "login" } = options;

  if (!(user instanceof User)) {
    throw new Error("loginAndValidate requires a User object");
  }

  const response = login(user);

  if (!validateResponse) {
    return { response, validationPassed: null };
  }

  const validationResults = check(response, {
    [`${testName} successful (status 200)`]: (r) =>
      r.status === CONSTANTS.HTTP_STATUS.OK,
    [`${testName} response has Auth_token property`]: (r) =>
      r.body.Auth_token !== null,
  });

  return { response, validationPassed: validationResults };
}

/**
 * Sign up and login a user with validation
 * @param {User} user - The User object to register and login
 * @param {Object} options - Validation options
 * @param {boolean} options.validateSignup - Whether to validate signup response (default: true)
 * @param {boolean} options.validateLogin - Whether to validate login response (default: true)
 * @returns {Object} Object containing both responses and validation results
 */
export function signUpAndLoginWithValidation(user, options = {}) {
  const { validateSignup = true, validateLogin = true } = options;

  if (!(user instanceof User)) {
    throw new Error("signUpAndLoginWithValidation requires a User object");
  }

  // Sign up
  const signupResult = signUpAndValidate(user, {
    validateResponse: validateSignup,
    testName: "sign-up",
  });

  // Login
  const loginResult = loginAndValidate(user, {
    validateResponse: validateLogin,
    testName: "login",
  });

  return {
    signup: signupResult,
    login: loginResult,
    allValidationsPassed:
      signupResult.validationPassed !== false &&
      loginResult.validationPassed !== false,
  };
}
