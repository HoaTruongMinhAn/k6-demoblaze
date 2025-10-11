import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

/**
 * Configuration Manager
 * Manages all application configuration and environment variables
 * Implements singleton pattern for consistent configuration access
 */
export class ConfigManager {
  constructor() {
    this.config = {
      PROJECT_ID: 999,
      PROJECT_NAME: "k6-demoblaze",
      BASE_URL: __ENV.BASE_URL || "https://api.demoblaze.com",
      API_TIMEOUT: __ENV.API_TIMEOUT || "30s",
      VUS: __ENV.VUS || 2,
      DURATION: __ENV.DURATION || "5s",
      THRESHOLDS: __ENV.THRESHOLDS || {
        http_req_duration: ["p(95)<500", "p(99)<1000", "max<2000"],
        http_req_failed: ["rate<0.01"],
        checks: ["rate>0.95"],
      },
      ENVIRONMENT: __ENV.ENVIRONMENT || "sit",
      ENDPOINTS: {
        SIGN_UP: "/signup",
        LOGIN: "/login",
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
      baseUrl: this.config.BASE_URL,
      endpoints: this.config.ENDPOINTS,
    };
  }

  /**
   * Get full URL for a specific endpoint
   * @param {string} endpoint - Endpoint name (e.g., "SIGN_UP")
   * @returns {string} Full URL
   */
  getUrl(endpoint) {
    return (
      this.getProjectInfo().baseUrl + this.getProjectInfo().endpoints[endpoint]
    );
  }

  /**
   * Get test options for k6 scenarios
   * @returns {Object} Test options object
   */
  getTestOptions() {
    return {
      vus: this.config.VUS,
      duration: this.config.DURATION,
      timeout: this.config.API_TIMEOUT,
      thresholds: this.config.THRESHOLDS,
    };
  }

  /**
   * Generate unique user information for testing
   * @returns {Object} User object with username and password
   */
  generateUserInfo() {
    return {
      username:
        this.config.USERNAME_PREFIX + randomString(8) + "_" + Date.now(),
      password: this.config.PASSWORD,
    };
  }

  /**
   * Validate required configuration
   * @throws {Error} If required configuration is missing
   * @returns {boolean} True if validation passes
   */
  validate() {
    const required = ["PROJECT_ID", "BASE_URL"];
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
    console.log("Base URL: " + this.getProjectInfo().baseUrl);
    console.log("VUs: " + this.getTestOptions().vus);
    console.log("Duration: " + this.getTestOptions().duration);
  }
}

// Create and export a singleton instance
export const configManager = new ConfigManager();
