import http from "k6/http";
import { configManager } from "../config/config-manager.js";
import { CONSTANTS } from "../config/constants.js";

/**
 * Authentication API Module
 * Handles all authentication-related API calls
 */

/**
 * Sign up a new user
 * @param {string} username - The username to register
 * @param {string} password - The password for the user
 * @returns {Response} HTTP response object
 */
export function signUp(username, password) {
  const url = configManager.getApiUrl("SIGN_UP");
  const payload = JSON.stringify({
    username: username,
    password: password,
  });

  const params = {
    headers: {
      "Content-Type": CONSTANTS.CONTENT_TYPES.APPLICATION_JSON,
    },
  };

  return http.post(url, payload, params);
}

/**
 * Login with existing credentials
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Response} HTTP response object
 */
export function login(username, password) {
  const url = configManager.getApiUrl("LOGIN");
  const payload = JSON.stringify({
    username: username,
    password: password,
  });

  const params = {
    headers: {
      "Content-Type": CONSTANTS.CONTENT_TYPES.APPLICATION_JSON,
    },
  };

  return http.post(url, payload, params);
}
