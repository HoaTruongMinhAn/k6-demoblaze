import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { User } from "../models/User.js";

/**
 * Configuration Manager
 * Manages all application configuration and environment variables
 * Implements singleton pattern for consistent configuration access
 */
export class ConfigManager {
  constructor() {
    // Environment-specific API URLs
    const apiUrls = {
      sit: "https://api.demoblaze.com",
      uat: "https://api.uat.demoblaze.com",
      prod: "https://api.prod.demoblaze.com",
    };

    // Environment-specific web URLs
    const webUrls = {
      sit: "https://demoblaze.com",
      uat: "https://uat.demoblaze.com",
      prod: "https://prod.demoblaze.com",
    };

    const environment = __ENV.ENVIRONMENT || "sit";
    const baseApiUrl = __ENV.BASE_URL || apiUrls[environment] || apiUrls.sit;
    const baseWebUrl = __ENV.WEB_URL || webUrls[environment] || webUrls.sit;

    this.config = {
      PROJECT_ID: 999,
      PROJECT_NAME: "k6-demoblaze",
      BASE_API_URL: baseApiUrl,
      BASE_WEB_URL: baseWebUrl,
      API_TIMEOUT: __ENV.API_TIMEOUT || "30s",
      VUS: __ENV.VUS || 2,
      DURATION: __ENV.DURATION || "5s",
      ITERATIONS: __ENV.ITERATIONS || 1,
      THRESHOLDS: __ENV.THRESHOLDS || {
        http_req_duration: ["p(95)<500", "p(99)<1000", "max<2000"],
        http_req_failed: ["rate<0.01"],
        checks: ["rate>0.95"],
      },
      ENVIRONMENT: environment,
      API_ENDPOINTS: {
        SIGN_UP: "/signup",
        LOGIN: "/login",
      },
      WEB_ENDPOINTS: {
        LANDING: "/",
      },
      USERNAME_PREFIX: __ENV.USERNAME_PREFIX || "tango_",
      PASSWORD: __ENV.PASSWORD || "MTIzNDU2", // raw value: 123456
    };
  }

  /**
   * Get configuration value by path (e.g., "api.baseUrl")
   * @param {string} path - Dot-separated path to config value
   * @returns {*} Configuration value
   */
  get(path) {
    return path.split(".").reduce((obj, key) => obj?.[key], this.config);
  }

  /**
   * Set configuration value by path
   * @param {string} path - Dot-separated path to config value
   * @param {*} value - Value to set
   */
  set(path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce(
      (obj, key) => (obj[key] = obj[key] || {}),
      this.config
    );
    target[lastKey] = value;
  }

  /**
   * Get project information
   * @returns {Object} Project configuration object
   */
  getProjectInfo() {
    return {
      id: this.config.PROJECT_ID,
      name: this.config.PROJECT_NAME,
      environment: this.config.ENVIRONMENT,
      baseApiUrl: this.config.BASE_API_URL,
      baseWebUrl: this.config.BASE_WEB_URL,
      apiEndpoints: this.config.API_ENDPOINTS,
      webEndpoints: this.config.WEB_ENDPOINTS,
    };
  }

  /**
   * Get full URL for a specific endpoint
   * @param {string} endpoint - Endpoint name (e.g., "SIGN_UP")
   * @returns {string} Full URL
   */
  getApiUrl(endpoint) {
    return (
      this.getProjectInfo().baseApiUrl +
      this.getProjectInfo().apiEndpoints[endpoint]
    );
  }

  /**
   * Get full URL for a specific endpoint
   * @param {string} endpoint - Endpoint name (e.g., "LANDING")
   * @returns {string} Full URL
   */
  getWebUrl(endpoint) {
    return (
      this.getProjectInfo().baseWebUrl +
      this.getProjectInfo().webEndpoints[endpoint]
    );
  }

  /**
   * Get test options for k6 scenarios
   * @returns {Object} Test options object
   */
  getTestOptions() {
    return {
      vus: this.config.VUS,
      iterations: this.config.ITERATIONS,
      duration: this.config.DURATION,
      timeout: this.config.API_TIMEOUT,
      thresholds: this.config.THRESHOLDS,
    };
  }

  /**
   * Generate unique user information for testing
   * @param {string} category - User category (e.g., 'customer', 'admin')
   * @returns {User} User instance with username and password
   */
  generateUserInfo(category = "customer") {
    const username =
      this.config.USERNAME_PREFIX + randomString(8) + "_" + Date.now();
    const password = this.config.PASSWORD;

    return new User(username, password, category);
  }

  /**
   * Generate unique user information as plain object (for backward compatibility)
   * @param {string} category - User category (e.g., 'customer', 'admin')
   * @returns {Object} User object with username and password
   */
  generateUserInfoObject(category = "customer") {
    const user = this.generateUserInfo(category);
    return user.toObject();
  }

  /**
   * Validate required configuration
   * @throws {Error} If required configuration is missing
   * @returns {boolean} True if validation passes
   */
  validate() {
    const required = ["PROJECT_ID", "BASE_API_URL", "BASE_WEB_URL"];
    const missing = required.filter((key) => !this.config[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(", ")}`);
    }

    return true;
  }

  /**
   * Log current configuration to console
   */
  log() {
    console.log("=== Configuration Manager ===");
    console.log(
      "Project: " +
        this.getProjectInfo().name +
        " (ID: " +
        this.getProjectInfo().id +
        ")"
    );
    console.log("Environment: " + this.getProjectInfo().environment);
    console.log("Base API URL: " + this.getProjectInfo().baseApiUrl);
    console.log("Base Web URL: " + this.getProjectInfo().baseWebUrl);
    console.log("VUs: " + this.getTestOptions().vus);
    console.log("Iterations: " + this.getTestOptions().iterations);
    console.log("Duration: " + this.getTestOptions().duration);
  }

  logProfile(profile) {
    console.log("=== Profile ===");
    console.log(`VUs: ${profile.vus}`);
    console.log(`Iterations: ${profile.iterations}`);
    console.log(`Duration: ${profile.duration}`);
    console.log(`Thresholds: ${JSON.stringify(profile.thresholds)}`);
  }
}

// Create and export a singleton instance
export const configManager = new ConfigManager();
