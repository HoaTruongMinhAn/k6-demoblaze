import http from "k6/http";
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
