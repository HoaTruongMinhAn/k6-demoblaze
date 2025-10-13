import { configManager } from "../../src/config/config-manager.js";
import {
  signUpAndValidate,
  loginAndValidate,
  signUpAndLoginWithValidation,
} from "../../src/api/auth-api.js";
import { getTestProfile } from "../../src/config/test-profiles.js";
import { getExistingUser } from "../../src/utils/test-data.js";
import { preActionDelay, betweenActionDelay } from "../../src/utils/timing.js";

/**
 * Advanced Mix Scenario Test - K6 Expert Approach
 *
 * This uses the most sophisticated K6 scenario configuration:
 * - Weighted distribution using scenario weights
 * - Different executors for different behaviors
 * - Realistic ramp-up patterns
 * - Advanced threshold configuration
 *
 * Distribution:
 * - 20% users only sign up (weight: 2)
 * - 20% users only login (weight: 2)
 * - 60% users sign up then login (weight: 6)
 */

const mixProfile = getTestProfile("mix");

export const options = {
  scenarios: {
    // New users exploring (signup only) - Gradual ramp-up
    new_users_exploring: {
      executor: "ramping-vus",
      exec: "signupOnly",
      startVUs: 0,
      stages: [
        { duration: "5s", target: Math.ceil(mixProfile.vus * 0.1) }, // Ramp up to 10% of target
        { duration: "10s", target: Math.ceil(mixProfile.vus * 0.2) }, // Ramp up to 20% of target
        { duration: "15s", target: Math.ceil(mixProfile.vus * 0.2) }, // Stay at 20%
      ],
      tags: { scenario: "new_users_exploring", user_type: "explorer" },
    },

    // Returning users (login only) - Steady state
    returning_users: {
      executor: "constant-vus",
      exec: "loginOnly",
      vus: Math.ceil(mixProfile.vus * 0.2), // 20% of total VUs
      duration: mixProfile.duration,
      tags: { scenario: "returning_users", user_type: "returning" },
    },

    // New users completing flow (signup + login) - Main traffic
    new_users_completing: {
      executor: "ramping-vus",
      exec: "signupAndLogin",
      startVUs: 0,
      stages: [
        { duration: "5s", target: Math.ceil(mixProfile.vus * 0.3) }, // Ramp up to 30% of target
        { duration: "10s", target: Math.ceil(mixProfile.vus * 0.6) }, // Ramp up to 60% of target
        { duration: "15s", target: Math.ceil(mixProfile.vus * 0.6) }, // Stay at 60%
      ],
      tags: { scenario: "new_users_completing", user_type: "completer" },
    },
  },

  // Advanced threshold configuration
  thresholds: {
    // Global thresholds
    http_req_duration: ["p(95)<2000", "p(99)<3000"],
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.90"],

    // Scenario-specific thresholds
    "http_req_duration{scenario:new_users_exploring}": ["p(95)<1500"], // Stricter for signup only
    "http_req_duration{scenario:returning_users}": ["p(95)<1000"], // Fastest for login only
    "http_req_duration{scenario:new_users_completing}": ["p(95)<2500"], // More lenient for full flow

    // User type thresholds
    "http_req_duration{user_type:explorer}": ["p(95)<1500"],
    "http_req_duration{user_type:returning}": ["p(95)<1000"],
    "http_req_duration{user_type:completer}": ["p(95)<2500"],
  },

  tags: {
    test_type: "mix_advanced",
    feature: "authentication",
  },
};

/**
 * Signup only scenario - New users who abandon after signup
 */
export function signupOnly() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndValidate(user);
  betweenActionDelay();
}

/**
 * Login only scenario - Returning users
 */
export function loginOnly() {
  preActionDelay();
  const user = getExistingUser("customer");
  loginAndValidate(user);
  betweenActionDelay();
}

/**
 * Signup and login scenario - New users completing full flow
 */
export function signupAndLogin() {
  preActionDelay();
  const user = configManager.generateUserInfo("customer");
  signUpAndLoginWithValidation(user);
  betweenActionDelay();
}

/**
 * Setup function - runs once before all scenarios
 */
export function setup() {
  console.log("=== Advanced Mix Scenario Test Setup ===");
  console.log(`Total VUs: ${mixProfile.vus}`);
  console.log(`New Users Exploring: 20% (ramping up)`);
  console.log(`Returning Users: 20% (constant)`);
  console.log(`New Users Completing: 60% (ramping up)`);
  console.log(`Duration: ${mixProfile.duration}`);
  console.log("Using advanced K6 scenario features with ramping patterns");
}

/**
 * Teardown function - runs once after all scenarios complete
 */
export function teardown(data) {
  console.log("=== Advanced Mix Scenario Test Complete ===");
}
